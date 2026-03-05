# Task: Complete Angular Applications for Feedback Management Platform

## BACK-OFFICE Implementation:
- [ ] 1a) Update back-office/app.config.ts - add provideHttpClient()
- [ ] 2a)Create back-office/src/app/services/feedback.service.ts  
- [ ] 3a)Create back-office/src/app/services/reclamation.service.rs → .ts
- [ ] 4a)Create back-office/src/app/services/resolution-action.service.rs → .ts  
- [ ] 5a)Create back-office/src/app/pages/feedbacks/feedbacks.{ts,html,css}
- [ ] 6a)Create back-office/src/app/pages/feedbacks/feedback-detail.{ts,html,css}
- [ ] 7a)Create back-office/src/app/pages/reclamations/reclamations.{ts,html,css}
- [ ] 8a)Create backoffice/src /app/pages/reclamations/reclamation-detail.{ts/html/css} 
-> Actually it's one folder so I'll do it as reclamations/detail but wait that's not right either... hmm let me think about how best organize these files in each project since we have multiple entities now...

Actually looking at existing structure more carefully: Each entity gets its own subfolder under pages/. So we'd have separate folders like "reclamations" containing all related views rather than mixing them together which makes sense from maintainability perspective too!

So continuing our list above after #8 would be updating routing config accordingly etc...
