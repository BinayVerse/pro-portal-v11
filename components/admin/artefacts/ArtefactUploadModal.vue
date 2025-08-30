<template>
  <UModal
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    prevent-close
    :ui="{ width: 'sm:max-w-4xl' }"
    :disabled="disabledControl"
    :class="{ 'disabled-modal': disabledControl }"
  >
    <div class="p-8">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-dark-600">
        <div>
          <h3 class="text-xl font-semibold text-white">Please choose an upload method:</h3>
        </div>
        <UButton
          @click="$emit('close')"
          variant="ghost"
          icon="heroicons:x-mark"
          color="gray"
          size="md"
          :disabled="isUploading"
          class="hover:bg-dark-700"
        />
      </div>

      <!-- Upload Method Tabs -->
      <div class="mb-6">
        <UTabs v-model="uploadType" :items="tabItems">

          <template #file>
            <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-6">
              <!-- File Category - First Position -->
              <UFormGroup label="File Category" name="category" required>
                <UInputMenu
                  v-model="state.category"
                  :options="categoryOptions"
                  placeholder="Select a Category or Add a new one"
                  :loading="isUploading"
                  searchable
                  :disabled="isUploading"
                  value-attribute="label"
                  :uiMenu="{
                    option: {
                      container: 'flex items-center w-full',
                    },
                  }"
                >
                  <template #option="{ option: category }">
                    <div class="relative flex items-center w-full p-2 pr-0">
                      <span class="truncate">{{ category.label }}</span>

                      <!-- Fully interactive button wrapper -->
                      <div
                        class="absolute right-2"
                        style="pointer-events: auto"
                        @mousedown.stop.prevent
                      >
                        <UButton
                          v-if="state.category !== category.label"
                          @click="deleteCategory(category.value)"
                          :ui="{ rounded: 'rounded-full' }"
                          icon="i-heroicons:trash"
                          variant="outline"
                          color="red"
                          size="xs"
                          :loading="isUploading"
                          :disabled="isUploading"
                        />
                      </div>
                    </div>
                  </template>
                  <template #option-empty="{ query }">
                    <div class="flex items-center justify-between w-full p-2">
                      <span class="text-gray-500">
                        <q>{{ query }}</q> category not found! Want to add?
                      </span>
                      <UButton
                        @click="addCategory(query)"
                        color="primary"
                        size="xs"
                        :loading="isUploading"
                        :disabled="isUploading"
                      >
                        Add
                      </UButton>
                    </div>
                  </template>
                  <template #empty>
                    No categories found
                  </template>
                </UInputMenu>
              </UFormGroup>

              <!-- Drag and Drop File Upload -->
              <UFormGroup label="File" name="file" required>
                <div
                  @drop.prevent="handleDrop"
                  @dragover.prevent="handleDragOver"
                  @dragenter.prevent="handleDragEnter"
                  @dragleave.prevent="handleDragLeave"
                  class="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center transition-colors relative"
                  :class="{
                    'border-blue-500 bg-blue-500/10': isDragOver,
                    'border-green-500 bg-green-500/10': state.file,
                    'hover:border-dark-500': !isDragOver && !state.file
                  }"
                >
                  <div v-if="!state.file" class="py-4">
                    <UIcon name="heroicons:cloud-arrow-up" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p class="text-lg text-gray-300 mb-2">
                      <span class="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-sm text-gray-400 mb-4">
                      PDF, Word, TXT, CSV, Markdown, Images
                    </p>
                    <p class="text-xs text-gray-500">
                      Maximum file size: 20MB
                    </p>
                    <input
                      ref="fileInput"
                      type="file"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.txt,.csv,.md,.png,.jpg,.jpeg"
                      @change="handleFileSelect"
                    />
                  </div>
                  <div v-else class="flex items-center justify-between py-4">
                    <div class="flex items-center space-x-4">
                      <UIcon name="heroicons:document" class="w-10 h-10 text-green-400" />
                      <div class="text-left">
                        <p class="text-white font-medium truncate max-w-md">{{ state.file.name }}</p>
                        <p class="text-sm text-gray-400">{{ formatFileSize(state.file.size) }} • {{ getFileType(state.file.name) }}</p>
                      </div>
                    </div>
                    <UButton
                      @click="removeFile"
                      variant="ghost"
                      icon="heroicons:x-mark"
                      color="red"
                      size="md"
                    />
                  </div>
                </div>
              </UFormGroup>

              <!-- Description -->
              <UFormGroup label="Description (Optional)" name="description">
                <UTextarea
                  v-model="state.description"
                  placeholder="Short description (max 100 characters)"
                  :maxlength="100"
                  :rows="3"
                  size="lg"
                />
                <p class="text-xs text-gray-400 mt-1">
                  {{ state.description?.length || 0 }}/100 characters
                </p>
              </UFormGroup>

              <div class="flex justify-end space-x-3 pt-6 border-t border-dark-600 mt-6">
                <UButton
                  @click="$emit('close')"
                  :disabled="isUploading"
                  variant="outline"
                  color="gray"
                  size="lg"
                  class="min-w-[120px]"
                >
                  Cancel
                </UButton>
                <UButton
                  type="submit"
                  :loading="isUploading"
                  :disabled="isUploading"
                  color="primary"
                  size="lg"
                  class="min-w-[120px]"
                  icon="heroicons:cloud-arrow-up"
                >
                  {{ isUploading ? 'Uploading...' : 'Upload' }}
                </UButton>
              </div>
            </UForm>
          </template>

          <template #google>
            <div class="space-y-6">
              <!-- File Category - First Position -->
              <UFormGroup label="File Category" required>
                <UInputMenu
                  v-model="googleDriveState.category"
                  :options="categoryOptions"
                  placeholder="Select a Category or Add a new one"
                  :loading="isUploadingFromGoogleDrive"
                  searchable
                  :disabled="isUploadingFromGoogleDrive"
                  value-attribute="label"
                  :uiMenu="{
                    option: {
                      container: 'flex items-center w-full',
                    },
                  }"
                >
                  <template #option="{ option: category }">
                    <div class="relative flex items-center w-full p-2 pr-0">
                      <span class="truncate">{{ category.label }}</span>

                      <!-- Fully interactive button wrapper -->
                      <div
                        class="absolute right-2"
                        style="pointer-events: auto"
                        @mousedown.stop.prevent
                      >
                        <UButton
                          v-if="googleDriveState.category !== category.label"
                          @click="deleteCategory(category.value)"
                          :ui="{ rounded: 'rounded-full' }"
                          icon="i-heroicons:trash"
                          variant="outline"
                          color="red"
                          size="xs"
                          :loading="isUploadingFromGoogleDrive"
                          :disabled="isUploadingFromGoogleDrive"
                        />
                      </div>
                    </div>
                  </template>
                  <template #option-empty="{ query }">
                    <div class="flex items-center justify-between w-full p-2">
                      <span class="text-gray-500">
                        <q>{{ query }}</q> category not found! Want to add?
                      </span>
                      <UButton
                        @click="addCategory(query)"
                        color="primary"
                        size="xs"
                        :loading="isUploadingFromGoogleDrive"
                        :disabled="isUploadingFromGoogleDrive"
                      >
                        Add
                      </UButton>
                    </div>
                  </template>
                  <template #empty>
                    No categories found
                  </template>
                </UInputMenu>
              </UFormGroup>

              <!-- Google Drive URL -->
              <UFormGroup label="Google drive public URL">
                <div class="flex space-x-2">
                  <input
                    v-model="googleDriveState.url"
                    type="url"
                    placeholder="Google drive URL eg: https://drive.google.com/drive/folders/1UMPf5gDy_mCW4v"
                    class="flex-1 px-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <UButton
                    @click="fetchGoogleDriveFiles"
                    :loading="isFetchingFiles"
                    color="primary"
                    size="lg"
                    class="min-w-[100px]"
                  >
                    Fetch Files
                  </UButton>
                  <UButton
                    @click="uploadFromGoogleDrive"
                    :disabled="googleDriveFiles.length === 0 || isUploadingFromGoogleDrive"
                    :loading="isUploadingFromGoogleDrive"
                    color="blue"
                    size="lg"
                    class="min-w-[180px]"
                  >
                    Upload from Google Drive
                  </UButton>
                </div>
              </UFormGroup>

              <!-- Note -->
              <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div class="flex items-start space-x-3">
                  <UIcon name="heroicons:information-circle" class="w-5 h-5 text-blue-400 mt-0.5" />
                  <div class="text-sm text-blue-300">
                    <p class="font-medium mb-1">Note:</p>
                    <p>By signing in, you allow us to access your Google Drive and download selected files to our server. Your files are not stored or shared beyond this process.</p>
                    <p class="mt-2">Supported file types: CSV, MS Word, PDF, Markdown, and Text files</p>
                  </div>
                </div>
              </div>

              <!-- Files Table -->
              <div class="border border-dark-700 rounded-lg overflow-hidden">
                <div class="bg-dark-900 px-4 py-3 border-b border-dark-700">
                  <div class="grid grid-cols-3 gap-4 text-sm font-medium text-gray-400">
                    <div>Name</div>
                    <div>File Type</div>
                    <div>Size</div>
                  </div>
                </div>

                <div class="bg-dark-800 min-h-[200px] flex items-center justify-center">
                  <div v-if="googleDriveFiles.length === 0" class="text-center py-8">
                    <UIcon name="heroicons:folder-open" class="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p class="text-gray-400 text-sm">No files available for selection.</p>
                  </div>
                  <div v-else class="w-full">
                    <div
                      v-for="file in googleDriveFiles"
                      :key="file.id"
                      class="px-4 py-3 border-b border-dark-700 hover:bg-dark-700/50 transition-colors"
                    >
                      <div class="grid grid-cols-3 gap-4 text-sm">
                        <div class="text-white font-medium">{{ file.name }}</div>
                        <div class="text-gray-400">{{ file.type }}</div>
                        <div class="text-gray-400">{{ file.size }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bottom Actions -->
              <div class="flex justify-end space-x-3 pt-6 border-t border-dark-600 mt-6">
                <UButton
                  @click="$emit('close')"
                  :disabled="isUploadingFromGoogleDrive"
                  variant="outline"
                  color="gray"
                  size="lg"
                  class="min-w-[120px]"
                >
                  Cancel
                </UButton>
                <UButton
                  @click="uploadFromGoogleDrive"
                  :disabled="googleDriveFiles.length === 0 || isUploadingFromGoogleDrive"
                  :loading="isUploadingFromGoogleDrive"
                  color="primary"
                  size="lg"
                  class="min-w-[120px]"
                  icon="heroicons:cloud-arrow-up"
                >
                  {{ isUploadingFromGoogleDrive ? 'Uploading...' : 'Upload' }}
                </UButton>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { nextTick } from 'vue'
import { useArtefactsStore } from '~/stores/artefacts'
import { useNotification } from '~/composables/useNotification'

interface GoogleDriveFile {
  id: string
  name: string
  type: string
  size: string
  mimeType?: string
  webViewLink?: string
  thumbnailLink?: string
  modifiedTime?: string
}

interface Props {
  isOpen: boolean
  availableCategories: string[]
}

const props = defineProps<Props>()

// Initialize artefacts store
const artefactsStore = useArtefactsStore()

// Initialize notification composable
const { showError, showWarning, showSuccess } = useNotification()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  close: []
  fileUploaded: [artefact: any]
  googleDriveUploaded: [artefacts: any[]]
  categoryAdded: [category: string]
  categoryDeleted: [category: string]
}>()

// Form validation schema
const schema = z.object({
  file: z.any().refine((file) => file !== null, 'File is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().max(100, 'Description must be 100 characters or less').optional(),
})

type Schema = z.output<typeof schema>

// Upload type - default to file upload (0 = file, 1 = google)
const uploadType = ref(0)

// Tab items for UTabs
const tabItems = [
  {
    value: 0,
    slot: 'file',
    label: 'File Upload',
    icon: 'i-heroicons-document'
  },
  {
    value: 1,
    slot: 'google',
    label: 'Google Drive',
    icon: 'i-logos-google-drive'
  }
]

// Google Drive state
const googleDriveState = reactive({
  category: '',
  url: '',
})

const isUploadingFromGoogleDrive = ref(false)

// Google Drive computed properties from store
const googleDriveFiles = computed(() => artefactsStore.googleDriveFiles)
const isFetchingFiles = computed(() => artefactsStore.isLoadingGoogleDrive)

// Form state for UForm
const state = reactive({
  file: null as File | null,
  category: '',
  description: '',
})

// Drag and drop state
const isDragOver = ref(false)
const dragCounter = ref(0)

// Upload states
const isUploading = ref(false)
const disabledControl = ref(false)

// File input ref
const fileInput = ref<HTMLInputElement>()

// Category options for USelectMenu
const categoryOptions = computed(() => {
  return props.availableCategories.map(category => ({
    label: category,
    value: category,
    deletable: true
  }))
})

// Drag and drop handlers
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value++
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragOver.value = false
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  dragCounter.value = 0

  const files = e.dataTransfer?.files
  if (files && files[0]) {
    setFile(files[0])
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    setFile(target.files[0])
  }
}

const setFile = (file: File) => {
  // Validate file size (20MB limit)
  if (file.size > 20 * 1024 * 1024) {
    showError('File size must be less than 20MB')
    return
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv', 'text/markdown', 'image/png', 'image/jpeg', 'image/jpg']
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
    showError('Unsupported file type. Please upload PDF, Word, TXT, CSV, Markdown, or Image files.')
    return
  }

  state.file = file
}

const removeFile = () => {
  state.file = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const getFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    txt: 'TXT',
    csv: 'CSV',
    md: 'Markdown',
    png: 'Image',
    jpg: 'Image',
    jpeg: 'Image',
  }
  return typeMap[extension || ''] || 'Unknown'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'kB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// UForm submission handler
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    isUploading.value = true

    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Create new artefact object
    const newArtefact = {
      id: Date.now(),
      name: event.data.file.name,
      description: event.data.description || 'No description provided',
      category: event.data.category,
      type: getFileType(event.data.file.name),
      size: formatFileSize(event.data.file.size),
      status: 'processing' as const,
      uploadedBy: 'Current User',
      lastUpdated: new Date().toLocaleString(),
      artefact: event.data.file.name,
    }

    emit('fileUploaded', newArtefact)

    // Reset form
    state.file = null
    state.category = ''
    state.description = ''

    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    isUploading.value = false
    showSuccess(`File "${newArtefact.name}" uploaded successfully!`)
    emit('close')

  } catch (error) {
    console.error('Upload failed:', error)
    showError('Upload failed. Please try again.')
    isUploading.value = false
  }
}

// Google Drive methods
const validateGoogleDriveUrl = (url: string): boolean => {
  const urlRegex = /^https?:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]{32,}\/?$/
  return urlRegex.test(url)
}

const fetchGoogleDriveFiles = async () => {
  if (!googleDriveState.url) {
    showWarning('Please enter a Google Drive URL')
    return
  }

  // Validate URL format
  if (!validateGoogleDriveUrl(googleDriveState.url)) {
    showError('Invalid Google Drive URL. Please use a valid folder URL.')
    return
  }

  try {
    const result = await artefactsStore.fetchGoogleDriveFiles(googleDriveState.url)

    if (!result.success) {
      showError(result.message || 'Failed to fetch files from Google Drive')
    } else if (result.files.length === 0) {
      showWarning('No supported files found in the Google Drive folder')
    } else {
      showSuccess(`Found ${result.files.length} supported file${result.files.length > 1 ? 's' : ''} in Google Drive folder`)
    }
  } catch (error) {
    console.error('Failed to fetch files:', error)
    showError('Failed to fetch files from Google Drive. Please check the URL and try again.')
  }
}

const uploadFromGoogleDrive = async () => {
  if (!googleDriveState.category) {
    showWarning('Please select a category')
    return
  }

  if (googleDriveFiles.value.length === 0) {
    showWarning('No files available to upload')
    return
  }

  try {
    isUploadingFromGoogleDrive.value = true

    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000))

    const newArtefacts = googleDriveFiles.value.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      description: 'Uploaded from Google Drive',
      category: googleDriveState.category,
      type: file.type,
      size: file.size,
      status: 'processing' as const,
      uploadedBy: 'Current User',
      lastUpdated: new Date().toLocaleString(),
      artefact: file.name,
    }))

    emit('googleDriveUploaded', newArtefacts)

    // Reset Google Drive state
    googleDriveState.category = ''
    googleDriveState.url = ''
    artefactsStore.clearGoogleDriveFiles()

    isUploadingFromGoogleDrive.value = false
    showSuccess(`Successfully uploaded ${newArtefacts.length} file${newArtefacts.length > 1 ? 's' : ''} from Google Drive!`)
    emit('close')

  } catch (error) {
    console.error('Upload from Google Drive failed:', error)
    showError('Upload failed. Please try again.')
    isUploadingFromGoogleDrive.value = false
  }
}

// Category management methods
const addCategory = (category: string) => {
  const trimmedCategory = category.trim()
  if (trimmedCategory) {
    emit('categoryAdded', trimmedCategory)
    state.category = trimmedCategory
    googleDriveState.category = trimmedCategory
  }
}

const deleteCategory = (category: string) => {
  emit('categoryDeleted', category)
}

// Reset all form fields when modal opens
const resetAllFields = () => {
  state.file = null
  state.category = ''
  state.description = ''
  googleDriveState.category = ''
  googleDriveState.url = ''
  artefactsStore.clearGoogleDriveFiles()

  if (fileInput.value) {
    fileInput.value.value = ''
  }

  isUploadingFromGoogleDrive.value = false
}

// Watch for modal state changes
watch(() => props.isOpen, (newVal, oldVal) => {
  if (newVal) {
    // Modal opened - reset to initial state
    uploadType.value = 0
    resetAllFields()
  } else if (oldVal === true && newVal === false) {
    // Modal closed - reset all fields
    nextTick(() => {
      resetAllFields()
    })
  }
})

// Watch for tab changes to reset form values
watch(uploadType, () => {
  // Reset form fields when switching between tabs
  state.file = null
  state.category = ''
  state.description = ''
  googleDriveState.category = ''
  googleDriveState.url = ''
  artefactsStore.clearGoogleDriveFiles()

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }

  // Reset loading states
  isUploadingFromGoogleDrive.value = false
})
</script>
