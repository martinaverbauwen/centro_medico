import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from './usuario.service';
import { TurnosMedicoService } from './turnos-medico.service';

type EstadoTurno = 'pendiente' | 'confirmado' | 'cancelado' | 'atendido';

@Component({
  selector: 'app-agenda-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda-medicos.component.html',
  styleUrls: ['./agenda-medicos.component.scss'],
  providers: [DatePipe]
})
export class AgendaMedicosComponent implements OnInit {

  medicos: any[] = [];
  selectedMedicoId: string = '';
  selectedMedico: any = null;

  turnos: any[] = [];
  error: string = '';

  filtroEstado: 'todos' | EstadoTurno = 'todos';

  today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  selectedDate: Date | null = null;

  // índice por día YYYY-MM-DD
  private indexPorDia: Record<string, any[]> = {};

  constructor(
    private usuarioService: UsuarioService,
    private turnosService: TurnosMedicoService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.selectedDate = new Date(this.currentYear, this.currentMonth, this.today.getDate());
    this.cargarMedicos();
  }

  // ================= MEDICOS =================

  cargarMedicos() {
    this.usuarioService.getMedicos().subscribe({
      next: (data) => {
        this.medicos = data || [];
        if (this.medicos.length) {
          this.selectedMedicoId = String(this.medicos[0].id);
          this.selectedMedico = this.medicos[0];
          this.cargarTurnosMes();
        }
      },
      error: () => {
        this.error = 'Error al cargar médicos';
      }
    });
  }

  onMedicoChange() {
    this.selectedMedico = this.medicos.find(m => String(m.id) === this.selectedMedicoId) || null;
    this.cargarTurnosMes();
  }

  // ================= FECHAS / HELPERS =================

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

  private dateFromDay(day: number): Date {
    const d = new Date(this.currentYear, this.currentMonth, day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ================= CARGA DE TURNOS =================

  cargarTurnosMes() {
    this.error = '';

    if (!this.selectedMedicoId) {
      this.turnos = [];
      this.indexPorDia = {};
      return;
    }

    const medicoId = Number(this.selectedMedicoId);
    const desde = this.formatDateTime(this.firstDayOfMonthDate());
    const hasta = this.formatDateTime(this.lastDayOfMonthDate());

    this.turnosService.getTurnosRango(desde, hasta, medicoId).subscribe({
      next: (data) => {
        this.turnos = data || [];
        this.reindexar();
      },
      error: () => {
        this.error = 'Error al cargar turnos del médico';
      }
    });
  }

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
      const diaIso = (t.fecha_hora || '').slice(0, 10);
      if (!this.indexPorDia[diaIso]) this.indexPorDia[diaIso] = [];
      this.indexPorDia[diaIso].push(t);
    }
  }

  // ================= CALENDARIO =================

  get firstDayOfWeek(): number {
    return new Date(this.currentYear, this.currentMonth, 1).getDay(); // 0 = domingo
  }

  get daysInMonth(): number {
    return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
  }

  get monthName(): string {
    return new Date(this.currentYear, this.currentMonth)
      .toLocaleString('es-ES', { month: 'long' });
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

  countDia(day: number): number {
    const iso = this.ymd(this.dateFromDay(day));
    return this.indexPorDia[iso]?.length ?? 0;
  }

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

  turnosDelDia(): any[] {
    if (!this.selectedDate) return [];
    const fechaSel = this.ymd(this.selectedDate);
    return this.indexPorDia[fechaSel] ?? [];
  }

  proximosTurnos(max = 10): any[] {
    const hoyIso = this.ymd(new Date());
    const todos = this.turnosFiltrados()
      .filter(t => (t.fecha_hora || '').slice(0, 10) >= hoyIso)
      .sort((a, b) => (a.fecha_hora < b.fecha_hora ? -1 : 1));
    return todos.slice(0, max);
  }
}
