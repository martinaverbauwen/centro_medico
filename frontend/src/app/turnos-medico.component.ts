import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosMedicoService } from './turnos-medico.service';

@Component({
  selector: 'app-turnos-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos-medico.component.html',
  styleUrls: ['./turnos-medico.component.scss']
})
export class TurnosMedicoComponent implements OnInit {
  // Día de la semana del primer día del mes actual (0=Domingo)
  get firstDayOfWeek(): number {
    return new Date(this.currentYear, this.currentMonth, 1).getDay();
  }

  // Selecciona un día en el calendario
  selectDay(dia: number) {
    this.selectedDate = new Date(this.currentYear, this.currentMonth, dia);
  }

  // Filtra los turnos del día seleccionado
  turnosDelDia(): any[] {
    if (!this.selectedDate) return [];
    const fecha = this.selectedDate.toISOString().slice(0, 10);
    return this.turnos.filter(t => t.fecha_hora && t.fecha_hora.slice(0, 10) === fecha);
  }

  turnos: any[] = [];
  error: string = '';

  today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  selectedDate: Date | null = null;

  // Edit/delete logic removed

  constructor(private turnosService: TurnosMedicoService) {}

  ngOnInit() {
    this.cargarTurnos();
  }

  cambiarMes(offset: number) {
    this.currentMonth += offset;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.selectedDate = null;
  }

  cargarTurnos() {
    this.turnosService.getTurnos().subscribe({
      next: (data) => this.turnos = data,
      error: () => this.error = 'Error al cargar turnos'
    });
  }

  get monthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('es-ES', { month: 'long' });
  }

  get daysInMonth(): number {
    return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
  }
  // Edit/delete methods removed
}
