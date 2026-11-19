/**
 * 小程序自定义导航 · 胶囊避让
 *
 * 计算微信胶囊按钮底部位置，生成可继承的 CSS 变量：
 *   --gf-capsule-safe   顶部交互内容起始位置（胶囊底部 + 间距）
 *   --gf-capsule-bottom 胶囊底部坐标
 *   --gf-capsule-right  胶囊右侧占位宽度
 *
 * 页面根节点绑定 :style="capsuleSafeStyle" 后，顶部栏统一下移到胶囊下方。
 * 非小程序端（H5 / App）没有微信胶囊，不预留导航栏 + 胶囊高度，
 * 顶部只保留状态栏高度 + 一点呼吸空间，内容整体上移。
 */

const CAPSULE_GAP = 8
const FALLBACK_NAV_HEIGHT = 44
const NON_MP_TOP_GAP = 8

// 条件编译：只有小程序端才需要给胶囊让位
// （先给默认值，再用条件编译覆盖，避免标准 JS 解析时重复声明）
let IS_MINI_PROGRAM = false
// #ifdef MP
IS_MINI_PROGRAM = true
// #endif

function toPx(value) {
  return Math.round(Number(value) || 0) + 'px'
}

function getSystemInfo() {
  try {
    return uni.getSystemInfoSync() || {}
  } catch (e) {
    return {}
  }
}

export function getCapsuleRect() {
  const sys = getSystemInfo()
  const statusBarHeight = Number(sys.statusBarHeight) || 0
  const windowWidth = Number(sys.windowWidth) || 375

  // H5 / App：无胶囊，顶部只留状态栏 + 少量间距（原来还要加 44px 导航 + 8px 胶囊）
  if (!IS_MINI_PROGRAM) {
    return {
      top: statusBarHeight,
      bottom: statusBarHeight,
      rightSpace: 0,
      safeTop: statusBarHeight + NON_MP_TOP_GAP,
      statusBarHeight
    }
  }

  let rect = null
  // #ifdef MP-WEIXIN
  if (typeof uni.getMenuButtonBoundingClientRect === 'function') {
    try {
      rect = uni.getMenuButtonBoundingClientRect()
    } catch (e) {
      rect = null
    }
  }
  // #endif

  const bottom = rect && rect.bottom ? Number(rect.bottom) : statusBarHeight + FALLBACK_NAV_HEIGHT
  const rightSpace = rect && rect.left ? windowWidth - Number(rect.left) : 97

  return {
    top: rect && rect.top ? Number(rect.top) : statusBarHeight + 4,
    bottom,
    rightSpace,
    safeTop: bottom + CAPSULE_GAP,
    statusBarHeight
  }
}

/** 直接绑定到页面根节点 style 的字符串（不用对象，避免小程序端 CSS 变量被过滤） */
export function getCapsuleSafeStyle() {
  const r = getCapsuleRect()
  return [
    `--gf-capsule-safe:${toPx(r.safeTop)}`,
    `--gf-capsule-bottom:${toPx(r.bottom)}`,
    `--gf-capsule-right:${toPx(r.rightSpace)}`
  ].join(';')
}
