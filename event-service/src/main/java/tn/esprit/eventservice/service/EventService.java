package tn.esprit.eventservice.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import tn.esprit.eventservice.entity.Event;
import tn.esprit.eventservice.entity.EventStatus;
import tn.esprit.eventservice.repository.EventRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    private final RestTemplate restTemplate;
    private final EventRepository eventRepository;

    private static final String REGISTRATION_DELETE_BY_EVENT =
            "http://localhost:8888/registrations/by-event/{eventId}";

    public EventService(EventRepository eventRepository, RestTemplate restTemplate) {
        this.eventRepository = eventRepository;
        this.restTemplate = restTemplate;
    }

    // ✅ AUTO status OPEN/CLOSED
    private void applyAutoStatus(Event e) {
        Date now = new Date();

        boolean datePassed = (e.getEventDate() != null && e.getEventDate().before(now));
        boolean noCapacity = (e.getCapacity() != null && e.getCapacity() <= 0);

        if (datePassed || noCapacity) {
            e.setStatus(EventStatus.CLOSED);
        } else {
            e.setStatus(EventStatus.OPEN);
        }
    }

    public List<Event> getAllEvents() {
        List<Event> events = eventRepository.findAll();

        // ✅ optionnel: recalcul au moment du GET (utile si date a changé)
        for (Event e : events) {
            applyAutoStatus(e);
        }
        // tu peux enregistrer si tu veux persister
        // eventRepository.saveAll(events);

        return events;
    }

    public Optional<Event> getEventById(Long id) {
        Optional<Event> e = eventRepository.findById(id);
        e.ifPresent(this::applyAutoStatus);
        return e;
    }

    public Event createEvent(Event event) {
        applyAutoStatus(event);
        return eventRepository.save(event);
    }

    public Optional<Event> updateEvent(Long id, Event updated) {
        return eventRepository.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            existing.setDescription(updated.getDescription());
            existing.setType(updated.getType());
            existing.setMode(updated.getMode());
            existing.setEventDate(updated.getEventDate());
            existing.setStartTime(updated.getStartTime());
            existing.setEndTime(updated.getEndTime());
            existing.setLocation(updated.getLocation());
            existing.setLatitude(updated.getLatitude());
            existing.setLongitude(updated.getLongitude());
            existing.setCapacity(updated.getCapacity());
            existing.setRequiredLevel(updated.getRequiredLevel());
            existing.setClubId(updated.getClubId());

            applyAutoStatus(existing);
            return eventRepository.save(existing);
        });
    }

    @Transactional
    public boolean deleteEventById(Long id) {

        if (!eventRepository.existsById(id)) return false;

        try {
            restTemplate.delete(REGISTRATION_DELETE_BY_EVENT, id);
        } catch (RestClientException ex) {
            throw new RuntimeException("Suppression registrations impossible : " + ex.getMessage());
        }

        eventRepository.deleteById(id);
        return true;
    }

    @Transactional
    public boolean deleteEventByDate(Date eventDate) {

        List<Event> events = eventRepository.findByEventDate(eventDate);
        if (events == null || events.isEmpty()) return false;

        for (Event e : events) {
            try {
                restTemplate.delete(REGISTRATION_DELETE_BY_EVENT, e.getIdEvent());
            } catch (RestClientException ex) {
                throw new RuntimeException(
                        "Suppression registrations impossible pour eventId=" + e.getIdEvent() + " : " + ex.getMessage()
                );
            }
        }

        eventRepository.deleteAll(events);
        return true;
    }

    @Transactional
    public boolean deleteEventByTitle(String title) {

        Event event = eventRepository.findByTitle(title);
        if (event == null) return false;

        try {
            restTemplate.delete(REGISTRATION_DELETE_BY_EVENT, event.getIdEvent());
        } catch (RestClientException ex) {
            throw new RuntimeException("Suppression registrations impossible : " + ex.getMessage());
        }

        eventRepository.delete(event);
        return true;
    }

    @Transactional
    public Event decrementCapacity(Long id) {

        eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event introuvable"));

        int updated = eventRepository.decrementCapacity(id);

        if (updated == 0) {
            throw new RuntimeException("Capacité insuffisante");
        }

        Event refreshed = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event introuvable"));

        applyAutoStatus(refreshed);
        return eventRepository.save(refreshed);
    }

    @Transactional
    public Event incrementCapacity(Long id) {

        eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event introuvable"));

        int updated = eventRepository.incrementCapacity(id);

        if (updated == 0) {
            throw new RuntimeException("Increment impossible");
        }

        Event refreshed = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event introuvable"));

        applyAutoStatus(refreshed);
        return eventRepository.save(refreshed);
    }

    @Transactional
    public Event sponsorEvent(Long eventId, Long clubId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event introuvable"));

        if (event.getSponsorClubId() != null) {
            throw new RuntimeException("Cet événement est déjà sponsorisé par un club");
        }

        event.setSponsorClubId(clubId);
        event.setClubId(clubId); // ✅ affecter aussi club_id
        event.setSponsoredAt(new Date()); // ✅ timestamp pour le scheduler
        return eventRepository.save(event);
    }

    // ✅ STATS (sans DTO)
    public List<Object[]> statsByStatus() {        return eventRepository.countByStatus();
    }

    public List<Object[]> statsByType() {
        return eventRepository.countByType();
    }

    public List<Object[]> statsByMode() {
        return eventRepository.countByMode();
    }

    public Long totalEvents() {
        return eventRepository.countAll();
    }
}