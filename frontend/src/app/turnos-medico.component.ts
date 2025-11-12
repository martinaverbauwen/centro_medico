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

  // Variables para el modal de confirmación
  mostrarModalCancelar = false;
  turnoACancelar: any = null;
  fechaTurnoACancelar = '';

  // Variables para el modal de reprogramación
  mostrarModalReprogramar = false;
  turnoAReprogramar: any = null;
  formReprog = { fecha: '', hora: '' };

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

  // Cancelar turno (mostrar modal de confirmación)
  cancelarTurno(turno: any) {
    this.turnoACancelar = turno;
    this.fechaTurnoACancelar = this.datePipe.transform(turno.fecha_hora, 'dd/MM/yyyy HH:mm') || '';
    this.mostrarModalCancelar = true;
  }

  // Cerrar modal de confirmación
  cerrarModal() {
    this.mostrarModalCancelar = false;
    this.turnoACancelar = null;
    this.fechaTurnoACancelar = '';
  }

  // Confirmar cancelación (eliminar turno)
  confirmarCancelacion() {
    if (this.turnoACancelar) {
      this.turnosService.eliminarTurno(this.turnoACancelar.id).subscribe({
        next: (response) => {
          // Eliminar el turno del array local
          const index = this.turnos.findIndex(t => t.id === this.turnoACancelar.id);
          if (index > -1) {
            this.turnos.splice(index, 1);
          }
          // Reindexar para actualizar la vista
          this.reindexar();
          console.log('Turno eliminado exitosamente');
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al eliminar turno:', error);
          this.error = 'Error al cancelar el turno. Intenta nuevamente.';
          this.cerrarModal();
        }
      });
    }
  }

  abrirModalReprogramar(turno: any) {
    this.turnoAReprogramar = turno;
    // Pre-cargar fecha y hora desde turno.fecha_hora (Date/ISO)
    const d = new Date(turno.fecha_hora);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');

    this.formReprog.fecha = `${yyyy}-${mm}-${dd}`;
    this.formReprog.hora  = `${hh}:${mi}`;
    this.mostrarModalReprogramar = true;
  }

  cerrarModalReprogramar() {
    this.mostrarModalReprogramar = false;
    this.turnoAReprogramar = null;
  }

  guardarReprogramacion() {
    if (!this.turnoAReprogramar) return;

    const payload = { fecha: this.formReprog.fecha, hora: this.formReprog.hora };

    this.turnosService.reprogramarTurno(this.turnoAReprogramar.id, payload).subscribe({
      next: () => {
        // feedback simple
        // podés reemplazar por tu toas/snackbar si lo tenés
        alert('Turno reprogramado correctamente');
        this.cerrarModalReprogramar();
        this.cargarTurnosMes(); // ya la tenés para refrescar
      },
      error: (err) => {
        alert(err?.error?.message || 'Error al reprogramar el turno');
      }
    });
  }
}
