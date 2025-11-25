import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact.service';
import { Contacto } from '../../models/contacto.model';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  DoughnutControllerChartOptions
} from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { RatingComponent } from '../rating/rating.component';

// Registrar los elementos necesarios de Chart.js
import { CategoryScale, LinearScale, BarController, BarElement } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarController, BarElement);
import { LineController, LineElement, PointElement } from 'chart.js';
Chart.register(LineController, LineElement, PointElement);
import { ArcElement } from 'chart.js';
Chart.register(ArcElement);

interface DashboardSummary {
  totalContacts: number;
  averageRating: number;
  topTypes: { type: string; count: number; percentage: number }[];
  recentContacts: { name: string; date: Date }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule,
    RatingComponent  // Añadir el RatingComponent a los imports
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  contacts: Contacto[] = [];
  summary: DashboardSummary | null = null;
  loading = true;
  error: string | null = null;

  // Declarar explícitamente las propiedades
  topRated: Contacto[] = [];
  lowRated: Contacto[] = [];

  // Configuración del gráfico de barras
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Distribución de Contactos por Tipo',
        font: {
          size: 14,
          family: "'Montserrat', sans-serif",
          weight:'600'  // Cambiado de '600' a 600
        }
      }
    }
  };

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: 'rgba(255,255,255,0.8)',
      borderWidth: 1
    }]
  };

  // Añadir configuración del gráfico de líneas
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        max: 5,
        ticks: { stepSize: 1 }
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Promedio de Calificaciones por Tipo',
        font: {
          size: 14,
          family: "'Montserrat', sans-serif",
          weight:'600'  // Cambiado de '600' a 600
        }
      }
    }
  };

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: 'rgba(78, 45, 62, 0.2)',
      borderColor: 'rgba(245, 45, 148, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(78, 45, 62, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(78, 45, 62, 1)',
      tension: 0.3
    }]
  };

  // Configuración para el gráfico de donut
  donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            family: "'Montserrat', sans-serif"
          }
        }
      },
      title: {
        display: true,
        text: 'Distribución de Tipos de Contacto',
        font: {
          size: 14,
          family: "'Montserrat', sans-serif",
          weight: '600'
        },
        color: '#4E2D3E',
        padding: 20
      }
    },
    cutout: '60%' // Ahora TypeScript reconocerá esta propiedad
  };

  donutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: 'rgba(255,255,255,0.8)',
      borderWidth: 1
    }]
  };

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.contactService.getAll().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.processDashboardData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Error al cargar los datos del dashboard';
        this.loading = false;
      }
    });
  }

  private processDashboardData() {
    this.processGeneralSummary();
    this.processContactsByType();
    this.processRatingsAverage(); // Añadir este método
    this.processDonutChart(); // Nuevo método
    this.processRankings(); // Añadir esta línea
  }

  private processGeneralSummary() {
    const totalContacts = this.contacts.length;

    // Calcular promedio general
    const totalRating = this.contacts.reduce((sum, contact) =>
      sum + (contact.averageRating || 0), 0);
    const averageRating = totalContacts > 0 ? totalRating / totalContacts : 0;

    // Contar tipos de contacto
    const typeCount = this.contacts.reduce((acc, contact) => {
      const type = contact.tipo_contacto || 'Sin tipo';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Obtener top 3 tipos
    const topTypes = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / totalContacts) * 100)
      }));

    // Obtener últimos 5 contactos
    const recentContacts = [...this.contacts]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5)
      .map(contact => ({
        name: contact.nombre,
        date: new Date()
      }));

    this.summary = {
      totalContacts,
      averageRating,
      topTypes,
      recentContacts
    };
  }

  private processContactsByType() {
    const typeCount = new Map<string, number>();
    let sinTipo = 0;

    this.contacts.forEach(contact => {
      if (!contact.tipo_contacto) {
        sinTipo++;
      } else {
        const count = typeCount.get(contact.tipo_contacto) || 0;
        typeCount.set(contact.tipo_contacto, count + 1);
      }
    });

    const labels = Array.from(typeCount.keys());
    labels.push('Sin tipo');

    const data = Array.from(typeCount.values());
    data.push(sinTipo);

    const baseColor = '78, 45, 62';
    const backgroundColor = labels.map((_, index) => {
      const opacity = 0.4 + (index * 0.5 / labels.length);
      return `rgba(${baseColor}, ${opacity})`;
    });

    const options: ChartConfiguration['options'] = {
      responsive: true,
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              size: 12
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Distribución de Contactos por Tipo',
          font: {
            size: 14,
            family: "'Montserrat', sans-serif",
            weight: '600'  // Cambiar de '600' a 600 (número)
          },
          color: '#4E2D3E',
          padding: 20
        }
      }
    };

    this.barChartOptions = options;
    this.barChartData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColor,
        borderColor: 'rgba(255,255,255,0.8)',
        borderWidth: 1
      }]
    };

    if (this.chart) {
      this.chart.update();
    }
  }

  // Añadir nuevo método para procesar rankings
  private processRankings() {
    // Filtrar contactos que tienen calificación
    const ratedContacts = this.contacts.filter(c =>
      c.averageRating !== undefined && c.averageRating !== null
    );

    // Ordenar por calificación (descendente para top, ascendente para low)
    const sortedByRating = [...ratedContacts].sort((a, b) =>
      (b.averageRating || 0) - (a.averageRating || 0)
    );

    // Obtener top 5 (mejores calificaciones)
    this.topRated = sortedByRating.slice(0, 5);

    // Obtener bottom 5 (peores calificaciones)
    // Ordenar de menor a mayor para los peores
    const lowestRated = [...ratedContacts].sort((a, b) =>
      (a.averageRating || 0) - (b.averageRating || 0)
    );
    this.lowRated = lowestRated.slice(0, 5);

    // Para asegurar que no se repitan contactos si hay pocos calificados
    if (ratedContacts.length <= 5) {
      // Si hay 5 o menos contactos calificados, mostrar solo en top o bottom según su calificación
      this.topRated = sortedByRating.filter(c => (c.averageRating || 0) >= 3);
      this.lowRated = sortedByRating.filter(c => (c.averageRating || 0) < 3);
    }
  }

  private processRatingsAverage() {
    const typeRatings = new Map<string, { sum: number; count: number }>();

    // Agrupar calificaciones por tipo de contacto
    this.contacts.forEach(contact => {
      const tipo = contact.tipo_contacto || 'Sin tipo';
      if (contact.averageRating !== undefined && contact.averageRating !== null) {
        if (!typeRatings.has(tipo)) {
          typeRatings.set(tipo, { sum: 0, count: 0 });
        }
        const current = typeRatings.get(tipo)!;
        current.sum += contact.averageRating;
        current.count++;
      }
    });

    // Calcular promedios
    const labels: string[] = [];
    const data: number[] = [];

    typeRatings.forEach((value, tipo) => {
      if (value.count > 0) {
        labels.push(tipo);
        data.push(Number((value.sum / value.count).toFixed(1)));
      }
    });

    const options: ChartConfiguration['options'] = {
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: {
              size: 12
            }
          }
        },
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            stepSize: 1,
            font: {
              size: 12
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Promedio de Calificaciones por Tipo',
          font: {
            size: 14,
            family: "'Montserrat', sans-serif",
            weight: '600'  // Cambiar de '600' a 600 (número)
          },
          color: '#4E2D3E',
          padding: 20
        }
      }
    };

    this.lineChartOptions = options;
    this.lineChartData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: 'rgba(78, 45, 62, 0.2)',
        borderColor: 'rgba(78, 45, 62, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(78, 45, 62, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(78, 45, 62, 1)',
        tension: 0.3
      }]
    };
  }

  private processDonutChart() {
    const typeCount = new Map<string, number>();
    let total = 0;

    // Contar contactos por tipo
    this.contacts.forEach(contact => {
      const tipo = contact.tipo_contacto || 'Sin tipo';
      typeCount.set(tipo, (typeCount.get(tipo) || 0) + 1);
      total++;
    });

    // Preparar datos para el gráfico
    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];
    const baseColor = '78, 45, 62';

    typeCount.forEach((count, tipo) => {
      labels.push(tipo);
      data.push((count / total) * 100);
      const opacity = 0.4 + (labels.length * 0.5 / typeCount.size);
      backgroundColor.push(`rgba(${baseColor}, ${opacity})`);
    });

    this.donutChartData = {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderColor: 'rgba(255,255,255,0.8)',
        borderWidth: 1
      }]
    };
  }

  getRatingValue(rating: number | undefined): number {
    return rating ?? 0;
  }

  getRatingText(rating: number | undefined): string {
    return rating?.toFixed(1) ?? '0.0';
  }
}
