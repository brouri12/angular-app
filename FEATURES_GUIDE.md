# Wordly Language School - Advanced Features Guide

This document explains the three main advanced features implemented in the PlanificationService.

---

## 1. Email Notifications System

### Overview
When you create a schedule (planification), the system automatically sends email notifications to all students in the assigned group.

### How It Works

#### Step-by-Step Flow:
1. **Admin creates a schedule** in the back-office (Schedules page)
2. **Backend validates** the schedule (checks room availability, time conflicts)
3. **Schedule is saved** to the database
4. **System finds all students** in the assigned group
5. **Email is sent** to each student with schedule details

#### Technical Implementation:

**Backend Components:**
- `EmailService.java` - Handles email sending via Gmail SMTP
- `PlanificationService.java` - Triggers email after creating schedule
- `UserClient.java` - Fetches student data from UserService

**Email Configuration** (`application.properties`):
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=jasserelghoul11@gmail.com
spring.mail.password=fwfomdrqxhokzpyv
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

**Email Content Includes:**
- Schedule title
- Type (COURS, EXAMEN, REUNION)
- Date (formatted: "Monday, April 15, 2026")
- Time (formatted: "10:00 - 12:00")
- Room name and location
- Group level

#### Example Email:
```
Subject: New Schedule: English Class

Dear John Doe,

A new schedule has been created for your group:

Schedule Details:
----------------
Title: English Class
Type: COURS
Date: Monday, April 15, 2026
Time: 10:00 - 12:00
Room: A-101 (Location: Building A, Floor 1)
Group Level: INTERMEDIATE

Please make sure to attend on time.

Best regards,
Wordly Language School
```

### Setup Requirements:

1. **Gmail App Password** (already configured):
   - Email: jasserelghoul11@gmail.com
   - App Password: fwfomdrqxhokzpyv

2. **Students must have email addresses** in the database

3. **PlanificationService must be running**

### Testing:
1. Create a group with students
2. Create a schedule for that group
3. Check students' email inboxes
4. Email should arrive within seconds

### Troubleshooting:
- **No email received**: Check student email in database
- **Authentication failed**: Verify Gmail app password
- **Service error**: Check IntelliJ console for errors

---

## 2. Auto-Create Groups By Level

### Overview
Automatically creates groups and assigns students based on their level (`niveau_actuel` field in the database).

### How It Works

#### Step-by-Step Flow:
1. **Admin clicks** "Auto-Create Groups By Level" button (Groups page)
2. **System reads** all students from UserService
3. **Students are grouped** by their `niveau_actuel` field:
   - BEGINNER students → BEGINNER group
   - INTERMEDIATE students → INTERMEDIATE group
   - ADVANCED students → ADVANCED group
4. **Groups are created** automatically
5. **Students are assigned** to their respective groups

#### Technical Implementation:

**Frontend** (`groups.component.ts`):
```typescript
autoCreateGroups(): void {
    // For each level (BEGINNER, INTERMEDIATE, ADVANCED)
    levels.forEach(level => {
        // Get unassigned students of this level
        const unassigned = this.getStudentsForNewGroup(level);
        
        if (unassigned.length > 0) {
            // Create group
            this.planifService.createGroup({ level: level })
                .pipe(
                    switchMap(newGroup => {
                        // Add all students to the group
                        return forkJoin(
                            unassigned.map(s => 
                                this.planifService.addStudentToGroup(
                                    newGroup.id, s.id_user
                                )
                            )
                        );
                    })
                )
                .subscribe();
        }
    });
}
```

**Student Filtering** (`getStudentsForNewGroup`):
```typescript
getStudentsForNewGroup(level: string): User[] {
    // Get all already assigned student IDs
    const allAssignedIds = new Set<number>();
    this.groups.forEach(g => {
        if (g.studentIds) g.studentIds.forEach(id => allAssignedIds.add(id));
    });
    
    // Filter students by level and not assigned
    return this.students.filter(s =>
        s.niveau_actuel?.trim().toUpperCase() === level.trim().toUpperCase() &&
        !allAssignedIds.has(s.id_user)
    );
}
```

### Example Scenario:

**Database State:**
```
Students:
- ID: 1, Name: John, niveau_actuel: "BEGINNER", Group: None
- ID: 2, Name: Jane, niveau_actuel: "BEGINNER", Group: None
- ID: 3, Name: Bob, niveau_actuel: "INTERMEDIATE", Group: None
- ID: 4, Name: Alice, niveau_actuel: "ADVANCED", Group: #5 (already assigned)
```

**After clicking "Auto-Create Groups":**
```
Groups Created:
- Group #10 (BEGINNER) → Students: John, Jane
- Group #11 (INTERMEDIATE) → Students: Bob
- No ADVANCED group created (Alice already assigned)
```

### Setup Requirements:

1. **Students must have `niveau_actuel` set** in database:
```sql
UPDATE users SET niveau_actuel = 'BEGINNER' WHERE id_user = 1;
UPDATE users SET niveau_actuel = 'INTERMEDIATE' WHERE id_user = 2;
UPDATE users SET niveau_actuel = 'ADVANCED' WHERE id_user = 3;
```

2. **Valid values**: BEGINNER, INTERMEDIATE, ADVANCED (case-insensitive)

3. **Students must NOT be in a group** already

### Testing:
1. Set student levels in database
2. Go to Back-Office → Groups page
3. Click "Auto-Create Groups By Level"
4. Confirm action
5. Groups are created and students assigned automatically

### Important Notes:
- **Only unassigned students** are grouped
- **Multiple clicks** create multiple groups (doesn't merge into existing)
- **Case-insensitive** matching (BEGINNER = beginner = Beginner)
- **Empty groups not created** (if no students for a level)

---

## 3. Room & Teacher Conflict Detection

### Overview
Prevents double-booking of rooms and teachers - ensures no conflicts when creating or updating schedules.

### How It Works

#### Validation Rules:

**1. Room Availability:**
- Same room cannot be booked twice at the same time
- Checks for time overlap on the same date

**2. Teacher Availability:**
- Same teacher cannot teach two classes at the same time
- Checks for time overlap on the same date

**3. Time Validation:**
- Start time must be before end time
- Start time cannot equal end time

#### Technical Implementation:

**Backend** (`PlanificationService.java`):

```java
@Transactional
public PlanificationDTO createPlanification(PlanificationDTO dto) {
    // 1. Validate time
    if (dto.getHeureDebut().isAfter(dto.getHeureFin())) {
        throw new IllegalArgumentException("Start time must be before end time");
    }
    
    // 2. Check room availability
    boolean salleAvailable = salleRepository.isSalleAvailable(
        dto.getSalleId(), dto.getDate(), dto.getHeureDebut(), dto.getHeureFin()
    );
    if (!salleAvailable) {
        throw new SchedulingConflictException("Room is not available at this time");
    }
    
    // 3. Check teacher availability
    if (group.getTeacherId() != null) {
        boolean teacherAvailable = planificationRepository.isTeacherAvailable(
            group.getTeacherId(), dto.getDate(), dto.getHeureDebut(), dto.getHeureFin()
        );
        if (!teacherAvailable) {
            throw new SchedulingConflictException("Teacher is not available at this time");
        }
    }
    
    // 4. Save schedule
    return planificationRepository.save(planification);
}
```

**Database Queries** (`PlanificationRepository.java`):

**Room Conflict Detection:**
```java
@Query("SELECT p FROM Planification p " +
       "WHERE p.salle.idSalle = :salleId AND p.date = :date " +
       "AND ((p.heureDebut < :endTime AND p.heureFin > :startTime))")
List<Planification> findBySalleAndDateAndTimeOverlap(
    @Param("salleId") Long salleId,
    @Param("date") LocalDate date,
    @Param("startTime") LocalTime startTime,
    @Param("endTime") LocalTime endTime
);
```

**Teacher Conflict Detection:**
```java
@Query("SELECT p FROM Planification p " +
       "WHERE p.group.teacherId = :teacherId AND p.date = :date " +
       "AND ((p.heureDebut < :endTime AND p.heureFin > :startTime))")
List<Planification> findByTeacherAndDateAndTimeOverlap(
    @Param("teacherId") Long teacherId,
    @Param("date") LocalDate date,
    @Param("startTime") LocalTime startTime,
    @Param("endTime") LocalTime endTime
);
```

### Time Overlap Logic:

**How it detects conflicts:**
```
Existing Schedule: 10:00 - 12:00
New Schedule:      11:00 - 13:00

Overlap Check:
- New start (11:00) < Existing end (12:00) ✓
- New end (13:00) > Existing start (10:00) ✓
→ CONFLICT! Both conditions true = overlap exists
```

**Examples:**

**Scenario 1: Room Conflict**
```
Existing: Room A-101, April 15, 10:00-12:00
New:      Room A-101, April 15, 11:00-13:00
Result:   ❌ ERROR: "Room is not available at this time"
```

**Scenario 2: Teacher Conflict**
```
Existing: Teacher John, April 15, 10:00-12:00
New:      Teacher John, April 15, 11:30-13:30
Result:   ❌ ERROR: "Teacher is not available at this time"
```

**Scenario 3: No Conflict**
```
Existing: Room A-101, April 15, 10:00-12:00
New:      Room A-101, April 15, 14:00-16:00
Result:   ✅ SUCCESS: No overlap, schedule created
```

**Scenario 4: Different Room, Same Time**
```
Existing: Room A-101, April 15, 10:00-12:00
New:      Room B-202, April 15, 10:00-12:00
Result:   ✅ SUCCESS: Different rooms, no conflict
```

### Update Schedule Validation:

When updating a schedule, the system:
1. **Excludes the current schedule** from conflict check
2. **Checks all other schedules** for conflicts
3. **Allows updating** if no conflicts with other schedules

```java
// Get conflicts excluding current schedule
List<Planification> conflicts = planificationRepository
    .findBySalleAndDateAndTimeOverlap(salleId, date, startTime, endTime)
    .stream()
    .filter(p -> !p.getIdPlanification().equals(currentScheduleId))
    .collect(Collectors.toList());
```

### Testing:

**Test 1: Room Conflict**
1. Create schedule: Room A-101, April 15, 10:00-12:00
2. Try to create: Room A-101, April 15, 11:00-13:00
3. Should show error: "Room is not available at this time"

**Test 2: Teacher Conflict**
1. Create schedule with Teacher John, April 15, 10:00-12:00
2. Try to create another with Teacher John, April 15, 11:00-13:00
3. Should show error: "Teacher is not available at this time"

**Test 3: Valid Schedule**
1. Create schedule: Room A-101, April 15, 10:00-12:00
2. Create schedule: Room A-101, April 15, 14:00-16:00
3. Should succeed (no overlap)

### Error Messages:

**Frontend Display:**
```
Failed to create schedule: Room is not available at this time
Failed to create schedule: Teacher is not available at this time
Failed to create schedule: Start time must be before end time
```

**Backend Exceptions:**
- `SchedulingConflictException` - Room or teacher conflict
- `IllegalArgumentException` - Invalid time range
- `ResourceNotFoundException` - Room or group not found

---

## Summary

### Email Notifications
✅ Automatic email to all students when schedule is created
✅ Uses Gmail SMTP
✅ Includes all schedule details

### Auto-Create Groups
✅ Groups students by their `niveau_actuel` field
✅ Creates BEGINNER, INTERMEDIATE, ADVANCED groups
✅ Only assigns unassigned students

### Conflict Detection
✅ Prevents room double-booking
✅ Prevents teacher double-booking
✅ Validates time ranges
✅ Works for both create and update operations

---

## Quick Reference

### Email Setup:
- Gmail: jasserelghoul11@gmail.com
- App Password: fwfomdrqxhokzpyv
- Configuration: `application.properties`

### Student Levels:
- Valid values: BEGINNER, INTERMEDIATE, ADVANCED
- Database field: `niveau_actuel`
- SQL: `UPDATE users SET niveau_actuel = 'BEGINNER' WHERE id_user = 1;`

### Conflict Rules:
- Same room + same time = ❌ Conflict
- Same teacher + same time = ❌ Conflict
- Different room + same time = ✅ OK
- Same room + different time = ✅ OK

---

## Troubleshooting

### Email not working:
1. Check Gmail app password
2. Verify student has email in database
3. Check IntelliJ console for errors

### Auto-create not working:
1. Check students have `niveau_actuel` set
2. Verify students are not already in groups
3. Check browser console (F12) for errors

### Conflict detection not working:
1. Restart PlanificationService
2. Check database has schedules
3. Verify time format is correct (HH:mm:ss)

---

**End of Guide**
