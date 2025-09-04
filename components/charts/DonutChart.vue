<template>
  <div class="h-64 w-full">
    <template v-if="series.length > 0">
      <apexchart type="donut" height="100%" width="100%" :options="chartOptions" :series="series" />
    </template>
    <template v-else>
      <div class="h-full flex items-center justify-center">
        <p class="text-gray-400 text-sm">No data available</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  labels: {
    type: Array,
    default: () => []
  },
  colors: {
    type: Array,
    default: () => []
  }
})

// helper to create random hex color
const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`

// use passed colors OR auto-generate based on label count
const chartColors = computed(() =>
  props.colors.length > 0
    ? props.colors
    : props.labels.map(() => getRandomColor())
)

const series = computed(() =>
  Array.isArray(props.data) && props.data.length > 0 ? props.data : []
)

const chartOptions = computed(() => {
  // Convert all values to numbers and calculate total
  const numericSeries = series.value.map(item => Number(item) || 0)
  const total = numericSeries.reduce((sum: number, value: number) => sum + value, 0)

  return {
    chart: {
      type: 'donut',
      height: '100%',
      width: '100%',
      toolbar: { show: false },
      background: 'transparent',
      foreColor: '#9CA3AF'
    },
    colors: chartColors.value,
    labels: props.labels,
    legend: {
      position: 'right',
      labels: { colors: '#9CA3AF' },
      itemMargin: { horizontal: 10, vertical: 5 }
    },
    dataLabels: {
      enabled: false // Disabled to remove labels on chart slices
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: '#9CA3AF',
              formatter: function (w: any) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                return Math.round(total).toString()
              }
            },
            value: {
              show: true,
              color: '#9CA3AF',
              formatter: function (val: number) {
                return Math.round(val).toString()
              }
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: { legend: { position: 'bottom' } }
      }
    ],
    tooltip: {
      theme: 'dark',
      fillSeriesColor: false,
      style: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#FFFFFF'
      },
      y: {
        formatter: (val: number) => {
          const percentage = total ? ((val / total) * 100).toFixed(1) : '0.0'
          return `${val} (${percentage}%)`
        }
      }
    }
  }
})
</script>