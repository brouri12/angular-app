# Planification Service

Microservice for managing schedules, rooms, students, teachers, and groups.

## Features

- **Room Management (Salle)**: Create, update, delete rooms with capacity and location
- **Student Management**: Manage students with levels (BEGINNER, INTERMEDIATE, ADVANCED)
- **Teacher Management**: Manage teachers with specialities
- **Group Management**: Automatically group students by level and assign teachers
- **Schedule Management (Planification)**: Create schedules with conflict detection
  - Validates room availability
  - Validates teacher availability
  - Validates time ranges

## Technology Stack

- Spring Boot 3.2.0
- Spring Data JPA
- MySQL Database
- Eureka Client (Service Discovery)
- Lombok
- SpringDoc OpenAPI (Swagger)

## Configuration

### Database
- Database: `wordly_planification`
- Port: 3306
- Username: root
- Password: (empty)

### Application
- Service Port: 8086
- Eureka Server: http://localhost:8761

## API Endpoints

### Rooms (Salles)
- `GET /api/salles` - Get all rooms
- `GET /api/salles/{id}` - Get room by ID
- `POST /api/salles` - Create new room
- `PUT /api/salles/{id}` - Update room
- `DELETE /api/salles/{id}` - Delete room
- `GET /api/salles/capacity/{minCapacity}` - Get rooms by minimum capacity
- `GET /api/salles/{id}/availability` - Check room availability

### Students
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/{id}` - Get teacher by ID
- `POST /api/teachers` - Create new teacher
- `PUT /api/teachers/{id}` - Update teacher
- `DELETE /api/teachers/{id}` - Delete teacher

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/{id}` - Get group by ID
- `POST /api/groups` - Create new group
- `DELETE /api/groups/{id}` - Delete group
- `POST /api/groups/{groupId}/teacher/{teacherId}` - Assign teacher to group
- `POST /api/groups/{groupId}/student/{studentId}` - Add student to group
- `POST /api/groups/auto-create` - Auto-create groups by student level

### Schedules (Planifications)
- `GET /api/planifications` - Get all schedules
- `GET /api/planifications/{id}` - Get schedule by ID
- `POST /api/planifications` - Create new schedule
- `PUT /api/planifications/{id}` - Update schedule
- `DELETE /api/planifications/{id}` - Delete schedule
- `GET /api/planifications/date/{date}` - Get schedules by date
- `GET /api/planifications/date-range` - Get schedules by date range

## How to Run

### Prerequisites
1. MySQL running on port 3306
2. EurekaServer running on port 8761

### Steps
1. Open project in IntelliJ IDEA
2. Wait for Maven dependencies to download
3. Run `PlanificationApplication.java`
4. Service will start on port 8086

### Verify
- Swagger UI: http://localhost:8086/swagger-ui.html
- API Docs: http://localhost:8086/api-docs
- Eureka Dashboard: http://localhost:8761

## Business Logic

### Student Grouping
- Students are automatically grouped by level (BEGINNER, INTERMEDIATE, ADVANCED)
- Each group has ONE level
- Each group can have ONE teacher
- Each group can have MULTIPLE students

### Scheduling Rules
1. Start time must be before end time
2. Room cannot have overlapping schedules
3. Teacher cannot have overlapping schedules
4. Each schedule requires:
   - One room (Salle)
   - One group
   - Date and time range

## Example Usage

### 1. Create Students
```json
POST /api/students
{
  "name": "John Doe",
  "level": "BEGINNER"
}
```

### 2. Create Teacher
```json
POST /api/teachers
{
  "name": "Prof. Smith",
  "speciality": "Mathematics"
}
```

### 3. Auto-Create Groups
```
POST /api/groups/auto-create
```
This will automatically group all students by their level.

### 4. Assign Teacher to Group
```
POST /api/groups/1/teacher/1
```

### 5. Create Room
```json
POST /api/salles
{
  "nomSalle": "Room A101",
  "capacite": 30,
  "localisation": "Building A, Floor 1"
}
```

### 6. Create Schedule
```json
POST /api/planifications
{
  "titre": "Mathematics Course",
  "type": "COURS",
  "date": "2026-04-01",
  "heureDebut": "09:00:00",
  "heureFin": "11:00:00",
  "salleId": 1,
  "groupId": 1
}
```

## Error Handling

The service handles:
- `ResourceNotFoundException` (404) - When entity not found
- `SchedulingConflictException` (409) - When scheduling conflict detected
- `MethodArgumentNotValidException` (400) - When validation fails
- Generic exceptions (500) - For unexpected errors

## Database Schema

Tables created automatically:
- `salles` - Rooms
- `students` - Students
- `teachers` - Teachers
- `student_groups` - Groups
- `planifications` - Schedules
