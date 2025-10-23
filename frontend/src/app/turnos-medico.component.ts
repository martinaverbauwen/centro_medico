import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosMedicoService } from './turnos-medico.service';

type EstadoTurno = 'pendiente' | 'confirmado' | 'cancelado' | 'atendido';

@Component({
  selector: 'app-turnos-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos-medico.component.html',
  styleUrls: ['./turnos-medico.component.scss'],
  providers: [DatePipe]
})
export class TurnosMedicoComponent implements OnInit {

  turnos: any[] = [];
  error: string = '';

  // Filtro de estado (UI chips)
  filtroEstado: 'todos' | EstadoTurno = 'todos';

  today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  selectedDate: Date | null = null;

  // Índices por día (YYYY-MM-DD) -> array turnos filtrados
  private indexPorDia: Record<string, any[]> = {};

  constructor(private turnosService: TurnosMedicoService, private datePipe: DatePipe) {}

  ngOnInit() {
    // Si es el mes actual, seleccionamos hoy; si cambiás de mes, se setea al 1.
    this.selectedDate = new Date(this.currentYear, this.currentMonth, this.today.getDate());
    this.cargarTurnosMes();
  }

  // ===== Helpers de fecha / formato =====
  private ymd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private firstDayOfMonthDate(): Date {
    const d = new Date(this.currentYear, this.currentMonth, 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private lastDayOfMonthDate(): Date {
    const d = new Date(this.currentYear, this.currentMonth + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private formatDateTime(d: Date): string {
    return this.datePipe.transform(d, 'yyyy-MM-dd HH:mm:ss')!;
  }

  // Devuelve Date del día N del mes actual
  private dateFromDay(day: number): Date {
    const d = new Date(this.currentYear, this.currentMonth, day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ===== Carga =====
  cargarTurnosMes() {
    const desde = this.formatDateTime(this.firstDayOfMonthDate());
    const hasta = this.formatDateTime(this.lastDayOfMonthDate());

    this.error = '';
    this.turnosService.getTurnosRango(desde, hasta).subscribe({
      next: (data) => {
        this.turnos = data || [];
        this.reindexar(); // construir índices por día según filtro actual
      },
      error: () => this.error = 'Error al cargar turnos'
    });
  }

  // ===== Filtro e índices =====
  setFiltro(estado: 'todos' | EstadoTurno) {
    this.filtroEstado = estado;
    this.reindexar();
  }

  private turnosFiltrados(): any[] {
    if (this.filtroEstado === 'todos') return this.turnos;
    return this.turnos.filter(t => (t.estado as EstadoTurno) === this.filtroEstado);
  }

  private reindexar() {
    this.indexPorDia = {};
    const lista = this.turnosFiltrados();

    for (const t of lista) {
      // t.fecha_hora: "YYYY-MM-DD HH:mm:ss"
      const diaIso = (t.fecha_hora || '').slice(0, 10);
      if (!this.indexPorDia[diaIso]) this.indexPorDia[diaIso] = [];
      this.indexPorDia[diaIso].push(t);
    }
  }

  // Cantidad de turnos filtrados en el día N del mes
  countDia(day: number): number {
    const iso = this.ymd(this.dateFromDay(day));
    return this.indexPorDia[iso]?.length ?? 0;
  }

  // Primeros pacientes (preview tooltip/título)
  previewDia(day: number): string {
    const iso = this.ymd(this.dateFromDay(day));
    const arr = this.indexPorDia[iso] ?? [];
    if (!arr.length) return '';
    const nombres = arr.slice(0, 3).map((t: any) =>
      `${t.paciente?.apellido ?? ''} ${t.paciente?.nombre ?? ''}`.trim()
    );
    const extra = arr.length > 3 ? ` +${arr.length - 3} más` : '';
    return nombres.join(', ') + extra;
  }

  // ===== Calendario / UI =====
  get firstDayOfWeek(): number {
    // 0 = Domingo
    return new Date(this.currentYear, this.currentMonth, 1).getDay();
  }

  get daysInMonth(): number {
    return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
  }

  get monthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('es-ES', { month: 'long' });
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
    this.selectedDate = new Date(this.currentYear, this.currentMonth, 1);
    this.cargarTurnosMes();
  }

  selectDay(dia: number) {
    this.selectedDate = new Date(this.currentYear, this.currentMonth, dia);
  }

  // Lista de turnos del día seleccionado (ya filtrados)
  turnosDelDia(): any[] {
    if (!this.selectedDate) return [];
    const fechaSel = this.ymd(this.selectedDate);
    return this.indexPorDia[fechaSel] ?? [];
  }

  // Próximos turnos (desde hoy en adelante) ya filtrados
  proximosTurnos(max = 10): any[] {
    const hoyIso = this.ymd(new Date());
    const todos = this.turnosFiltrados()
      .filter(t => (t.fecha_hora || '').slice(0, 10) >= hoyIso)
      .sort((a, b) => (a.fecha_hora < b.fecha_hora ? -1 : 1));
    return todos.slice(0, max);
  }
}
