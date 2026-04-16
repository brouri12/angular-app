import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-progressive-quiz',
  standalone: true,
  imports: [],
  template: '<div class="flex justify-center items-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div></div>'
})
export class ProgressiveQuizComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Redirect to unified game-play
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/games', id, 'play'], { replaceUrl: true });
  }
}
