import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  values = [
    {
      title: 'Excellence',
      description: 'We strive for excellence in every course, ensuring the highest quality education.',
    },
    {
      title: 'Innovation',
      description: 'We embrace innovation and stay ahead of industry trends to provide cutting-edge content.',
    },
    {
      title: 'Community',
      description: 'We foster a supportive community where learners can connect, collaborate, and grow together.',
    },
  ];
}
