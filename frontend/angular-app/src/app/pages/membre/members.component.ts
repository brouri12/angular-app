import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { Member, NiveauAnglais } from '../../models/member.model';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css'],
})
export class MembersComponent implements OnInit {

  loading = false;
  errorMsg = '';
  successMsg = '';

  members: Member[] = [];
  niveaux: NiveauAnglais[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

  // ✅ déclaré ici, initialisé dans ngOnInit
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {

    // ✅ maintenant fb est prêt
    this.form = this.fb.group({
      idUser: [null, [Validators.required, Validators.min(1)]],
    idClub: [null, [Validators.required, Validators.min(1)]], // ✅ NEW

      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required]],
      niveauAnglais: ['B2' as NiveauAnglais, [Validators.required]],
      dateJoin: [''], // optionnel (yyyy-MM-dd)
    });

    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = '';

    this.memberService.getAll().subscribe({
      next: (data) => {
        this.members = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error || 'Erreur lors du chargement';
        this.loading = false;
      }
    });
  }

  submit() {
    this.errorMsg = '';
    this.successMsg = '';

    if (this.form.invalid) {
      this.errorMsg = 'Veuillez remplir tous les champs correctement.';
      this.form.markAllAsTouched();
      return;
    }

    const payload: Member = {
  idUser: Number(this.form.value['idUser']),
  idClub: Number(this.form.value['idClub']), // ✅ NEW
  nom: this.form.value['nom'],
  prenom: this.form.value['prenom'],
  email: this.form.value['email'],
  telephone: this.form.value['telephone'],
  niveauAnglais: this.form.value['niveauAnglais'],
  dateJoin: this.form.value['dateJoin'] || undefined,
};

    this.loading = true;

    this.memberService.create(payload).subscribe({
      next: (created) => {
        this.successMsg = `Membre ajouté (idMember=${created.idMember})`;
        this.form.reset({ niveauAnglais: 'B2' as NiveauAnglais });
        this.load();
      },
      error: (err) => {
        this.errorMsg = err?.error || 'Erreur lors de l’ajout';
        this.loading = false;
      }
    });
  }

  remove(idMember?: number) {
    if (!idMember) return;

    this.errorMsg = '';
    this.successMsg = '';
    this.loading = true;

    this.memberService.delete(idMember).subscribe({
      next: () => {
        this.successMsg = 'Membre supprimé ✅';
        this.load();
      },
      error: (err) => {
        this.errorMsg = err?.error || 'Erreur lors de la suppression';
        this.loading = false;
      }
    });
  }
}