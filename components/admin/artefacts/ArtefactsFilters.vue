<template>
  <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
    <div class="flex flex-col lg:flex-row gap-4">
      <!-- Search Input -->
      <div class="flex-1">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UIcon name="heroicons:magnifying-glass" class="h-5 w-5 text-gray-400" />
          </div>
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Search artefacts..."
            class="block w-full pl-10 pr-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <!-- Category Filter -->
      <div class="lg:w-48">
        <USelect
          :model-value="selectedCategory"
          @update:model-value="$emit('update:selectedCategory', $event)"
          :options="[
            { label: 'All Categories', value: '' },
            ...availableCategories.map(cat => ({ label: cat, value: cat }))
          ]"
          placeholder="All Categories"
          size="lg"
        />
      </div>

      <!-- Type Filter -->
      <div class="lg:w-48">
        <select
          :value="selectedType"
          @change="$emit('update:selectedType', ($event.target as HTMLSelectElement).value)"
          class="block w-full px-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">All Types</option>
          <option value="PDF">PDF</option>
          <option value="Word">Word</option>
          <option value="Markdown">Markdown</option>
          <option value="TXT">TXT</option>
          <option value="CSV">CSV</option>
          <option value="Image">Image</option>
          <option value="Database">Database</option>
        </select>
      </div>

      <!-- Status Filter -->
      <div class="lg:w-48">
        <select
          :value="selectedStatus"
          @change="$emit('update:selectedStatus', ($event.target as HTMLSelectElement).value)"
          class="block w-full px-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">All Status</option>
          <option value="processed">Processed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  searchQuery: string
  selectedCategory: string
  selectedType: string
  selectedStatus: string
  availableCategories: string[]
}

defineProps<Props>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedCategory': [value: string]
  'update:selectedType': [value: string]
  'update:selectedStatus': [value: string]
}>()
</script>
