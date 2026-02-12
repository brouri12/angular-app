import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  enrolledCourses: number;
  joinDate: string;
  avatar: string;
}

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  users: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Student',
      status: 'active',
      enrolledCourses: 5,
      joinDate: '2024-01-15',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=00c897&color=fff'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Instructor',
      status: 'active',
      enrolledCourses: 12,
      joinDate: '2023-11-20',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=ff7f50&color=fff'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.j@example.com',
      role: 'Student',
      status: 'inactive',
      enrolledCourses: 3,
      joinDate: '2024-02-10',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=00c897&color=fff'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.w@example.com',
      role: 'Student',
      status: 'active',
      enrolledCourses: 8,
      joinDate: '2023-12-05',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=ff7f50&color=fff'
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.b@example.com',
      role: 'Instructor',
      status: 'active',
      enrolledCourses: 15,
      joinDate: '2023-10-12',
      avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=00c897&color=fff'
    },
    {
      id: 6,
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      role: 'Student',
      status: 'active',
      enrolledCourses: 6,
      joinDate: '2024-01-28',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=ff7f50&color=fff'
    }
  ];

  selectedRole = 'all';
  selectedStatus = 'all';

  get filteredUsers() {
    return this.users.filter(user => {
      const roleMatch = this.selectedRole === 'all' || user.role.toLowerCase() === this.selectedRole;
      const statusMatch = this.selectedStatus === 'all' || user.status === this.selectedStatus;
      return roleMatch && statusMatch;
    });
  }

  editUser(user: User) {
    console.log('Edit user:', user);
  }

  deleteUser(user: User) {
    console.log('Delete user:', user);
  }
}
