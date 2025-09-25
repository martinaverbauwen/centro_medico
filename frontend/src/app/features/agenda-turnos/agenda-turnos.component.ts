import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TurnosService, Turno } from '../../core/services/turnos.service';

@Component({
  selector: 'app-agenda-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <h2>Agenda de Turnos</h2>

    <label>Fecha:
      <input type="date" [(ngModel)]="fecha" (change)="listar()">
    </label>

    <form [formGroup]="form" (ngSubmit)="crear()" style="display:flex; gap:.5rem; margin:.75rem 0; flex-wrap:wrap;">
      <input type="date" formControlName="fecha">
      <input type="time" formControlName="hora" placeholder="HH:mm">
      <input type="number" formControlName="paciente_id" placeholder="Paciente ID" min="1">
      <input type="number" formControlName="medico_id" placeholder="Médico ID" min="1">
      <input type="number" formControlName="especialidad_id" placeholder="Especialidad ID" min="1">
      <button>Crear</button>
    </form>

    <table border="1" cellpadding="6">
      <thead>
        <tr><th>Hora</th><th>Paciente</th><th>Médico</th><th>Especialidad</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of turnos">
          <td>
            <input *ngIf="edit[t.id!]" [(ngModel)]="t.hora" name="hora{{t.id}}">
            <span *ngIf="!edit[t.id!]">{{t.hora}}</span>
          </td>
          <td>
            <input *ngIf="edit[t.id!]" [(ngModel)]="t.paciente_id" name="pac{{t.id}}" type="number" min="1">
            <span *ngIf="!edit[t.id!]">{{t.paciente_id}}</span>
          </td>
          <td>
            <input *ngIf="edit[t.id!]" [(ngModel)]="t.medico_id" name="med{{t.id}}" type="number" min="1">
            <span *ngIf="!edit[t.id!]">{{t.medico_id}}</span>
          </td>
          <td>
            <input *ngIf="edit[t.id!]" [(ngModel)]="t.especialidad_id" name="esp{{t.id}}" type="number" min="1">
            <span *ngIf="!edit[t.id!]">{{t.especialidad_id}}</span>
          </td>
          <td>
            <button *ngIf="!edit[t.id!]" (click)="edit[t.id!]=true">Editar</button>
            <button *ngIf="!edit[t.id!]" (click)="eliminar(t.id)">Eliminar</button>
            <button *ngIf="edit[t.id!]"  (click)="guardar(t)">Guardar</button>
            <button *ngIf="edit[t.id!]"  (click)="edit[t.id!]=false">Cancelar</button>
          </td>
        </tr>
        <tr *ngIf="!turnos.length"><td colspan="5">Sin turnos</td></tr>
      </tbody>
    </table>
  `
})
export class AgendaTurnosComponent {
  fecha = new Date().toISOString().slice(0,10);
  turnos: Turno[] = [];
  edit: Record<number, boolean> = {};
  form: FormGroup;

  constructor(private fb: FormBuilder, private api: TurnosService) {
    this.form = this.fb.group({
      fecha: [this.fecha, Validators.required],
      hora: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
      paciente_id: [null as number|null, [Validators.required, Validators.min(1)]],
      medico_id: [null as number|null, [Validators.required, Validators.min(1)]],
      especialidad_id: [null as number|null, [Validators.required, Validators.min(1)]],
    });
    this.listar();
  }

  private fixHora(h: string) { return /^\d{2}:\d{2}:\d{2}$/.test(h) ? h : (h ? h + ':00' : h); }

  listar() {
    this.api.list({ fecha: this.fecha }).subscribe({
      next: (r: Turno[]) => this.turnos = r
    });
  }

  crear() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload: Turno = { ...(this.form.value as Turno), hora: this.fixHora(this.form.value.hora!) };
    this.api.create(payload).subscribe({
      next: () => { this.form.patchValue({ hora:'' }); this.listar(); }
    });
  }

  guardar(t: Turno) {
    if (!t.id) return;
    const payload = { ...t, hora: this.fixHora(t.hora) };
    this.api.update(t.id, payload).subscribe({
      next: () => { this.edit[t.id!] = false; this.listar(); }
    });
  }

  eliminar(id?: number) {
    if (!id) return;
    if (!confirm('¿Eliminar?')) return;
    this.api.delete(id).subscribe({ next: () => this.listar() });
  }
}
