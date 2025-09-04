<!-- /components/charts/StackedAreaChart.vue -->
<template>
  <div class="h-80">
    <apexchart type="area" height="100%" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  colors: {
    type: Array,
    default: () => ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']
  }
})

// Convert to numeric timestamps for datetime mode
const series = computed(() => {
  return props.data.map((userData: any, index: number) => ({
    name: userData.name,
    data: userData.data.map((point: any) => ({
      x: new Date(point.x).getTime(), // Convert to timestamp
      y: point.y
    })),
    color: props.colors[index % props.colors.length]
  }))
})

const chartOptions = ref({
  chart: {
    type: 'area',
    height: '100%',
    stacked: false,
    toolbar: {
      show: false
    },
    background: 'transparent',
    foreColor: '#9CA3AF',
    zoom: {
      enabled: false
    }
  },
  colors: props.colors,
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  fill: {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.4,
      opacityTo: 0.8,
      stops: [0, 90, 100]
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    labels: {
      colors: '#9CA3AF'
    }
  },
  xaxis: {
    type: 'datetime', // Use datetime type
    labels: {
      datetimeFormatter: {
        year: 'yyyy',
        month: 'MMM \'yy',
        day: 'dd MMM',
        hour: 'HH:mm'
      },
      // Add format to show day and month more clearly
      format: 'MMM dd',
    },
    axisBorder: {
      color: '#374151'
    },
    axisTicks: {
      color: '#374151'
    }
  },
  yaxis: {
    labels: {
      formatter: function (val: number) {
        return val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val.toString()
      }
    }
  },
  tooltip: {
    theme: 'dark',
    shared: true,
    intersect: false,
    x: {
      format: 'dd MMM yyyy' // Tooltip will show exact date
    },
    y: {
      formatter: function (val: number) {
        return val.toLocaleString() + ' tokens'
      }
    }
  },
  grid: {
    borderColor: '#374151',
    strokeDashArray: 4,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  }
})

</script>