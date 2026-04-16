package tn.esprit.clubservice.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import tn.esprit.clubservice.dto.MemberLookupDto;

import java.util.List;

@FeignClient(name = "MEMBRE-SERVICE")
public interface MemberFeignClient {

    @GetMapping("/membres/by-user/{idUser}")
    List<MemberLookupDto> findMembershipsByUser(@PathVariable("idUser") Long idUser);

    @PostMapping("/membres/score")
    void addScore(@RequestParam("idUser") Long idUser,
                  @RequestParam("idClub") Long idClub,
                  @RequestParam("points") int points);
}
