/**
 * Icon geometry on a 24x24 grid, stroke-based so the colour comes from `currentColor`
 * and the weight from the parent button. Every icon renders the same visual size class
 * so a toolbar row never has one glyph sitting a pixel higher than its neighbour.
 *
 * The inner markup is a string because most of these mix <circle>/<rect> with <path>,
 * and flattening them into paths would make the source unreadable. These are hardcoded
 * literals in this file — never derived from organiser input — so the v-html in
 * AppIcon.vue has nothing untrusted to inject.
 */
export const ICONS = {
  trophy:
    '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/>' +
    '<path d="M17 5h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 5H5.5a2.5 2.5 0 0 0 0 5H7"/>',
  presentation:
    '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4"/><path d="M8 20h8"/>',
  'volume-x':
    '<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="m16 9.5 4 5"/><path d="m20 9.5-4 5"/>',
  'volume-2':
    '<path d="M11 5 6.5 9H3v6h3.5L11 19z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>' +
    '<path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  crown: '<path d="m2.5 8 4 2.8L12 4l5.5 6.8 4-2.8-1.7 11.5H4.2z"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/>',
  'chevron-up': '<path d="m6 15 6-6 6 6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2.5 1.5"/><path d="M9.5 2.5h5"/>'
}

export const ICON_SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-6 h-6'
}

export const ICON_STROKE_WIDTH = 2
