<template>
  <div v-if="names" class="px-2" aria-live="polite">
    <span
      class="inline-block bg-cc-leader text-cc-leader-ink text-base sm:text-lg font-semibold px-3 py-1 rounded-full shadow"
    >
      &#9813; Memimpin: {{ names }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'LeaderBanner',
  props: {
    names: { type: String, default: '' }
  }
}
</script>
