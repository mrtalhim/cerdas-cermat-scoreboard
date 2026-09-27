<template>
  <div v-if="names" class="px-2" aria-live="polite">
    <span
      class="inline-flex items-center gap-1.5 bg-cc-leader text-cc-leader-ink text-base sm:text-lg font-semibold px-3 py-1 rounded-full shadow"
    >
      <AppIcon name="crown" size="sm" />
      Memimpin: {{ names }}
    </span>
  </div>
</template>

<script>
import AppIcon from './AppIcon.vue'

export default {
  name: 'LeaderBanner',
  components: { AppIcon },
  props: {
    names: { type: String, default: '' }
  }
}
</script>
