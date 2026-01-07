/**
 * 改进的脚本检测函数 - 支持 iframe 环境
 * 用于角色卡的 system_prompt 或 post_history_instructions
 * 
 * 使用方法：复制下面的代码到角色卡的 system_prompt 或 post_history_instructions 中
 */

// 检测外置脚本状态（支持 iframe 环境）
function detectDetentionSystem() {
  let scriptStatus = "降级模式";
  let statusPanelMode = "builtin";
  let DS = null;
  let DSLocation = "未找到";

  // 首先检查主窗口
  if (typeof window !== 'undefined' && window.detentionSystem) {
    try {
      if (window.detentionSystem.ping && window.detentionSystem.ping()) {
        DS = window.detentionSystem;
        DSLocation = "主窗口";
        scriptStatus = "外置脚本模式";
        const statusPanel = window.detentionSystem.getModule("statusPanel");
        if (statusPanel && typeof statusPanel.getState === "function") {
          statusPanelMode = "external";
        }
        return { scriptStatus, statusPanelMode, DS, DSLocation };
      }
    } catch(e) {
      // 主窗口检测失败，继续查找 iframe
    }
  }

  // 如果主窗口没有，尝试在所有 iframe 中查找
  if (typeof document !== 'undefined') {
    const iframes = document.querySelectorAll('iframe');
    
    // 首先尝试通过 name 属性查找脚本 iframe
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      const iframeName = iframe.name || '';
      const iframeId = iframe.id || '';

      // 检查是否是脚本 iframe
      if (
        iframeName.includes('script') ||
        iframeName.includes('TH-script') ||
        iframeName.includes('detention') ||
        iframeId.includes('script') ||
        iframeId.includes('TH-script') ||
        iframeId.includes('detention')
      ) {
        try {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow && iframeWindow.detentionSystem) {
            if (iframeWindow.detentionSystem.ping && iframeWindow.detentionSystem.ping()) {
              DS = iframeWindow.detentionSystem;
              DSLocation = `脚本 iframe[${i}] (name: ${iframeName || '无name'}, id: ${iframeId || '无id'})`;
              scriptStatus = "外置脚本模式";
              const statusPanel = iframeWindow.detentionSystem.getModule("statusPanel");
              if (statusPanel && typeof statusPanel.getState === "function") {
                statusPanelMode = "external";
              }
              // 将找到的 DS 保存到主窗口，方便后续使用
              window._detentionSystem = DS;
              window._detentionSystemLocation = DSLocation;
              return { scriptStatus, statusPanelMode, DS, DSLocation };
            }
          }
        } catch (e) {
          // 跨域 iframe 无法访问，跳过
        }
      }
    }

    // 如果还没找到，遍历所有 iframe（可能跨域问题）
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && iframeWindow.detentionSystem) {
          if (iframeWindow.detentionSystem.ping && iframeWindow.detentionSystem.ping()) {
            DS = iframeWindow.detentionSystem;
            DSLocation = `iframe[${i}] (name: ${iframe.name || '无name'}, id: ${iframe.id || '无id'})`;
            scriptStatus = "外置脚本模式";
            const statusPanel = iframeWindow.detentionSystem.getModule("statusPanel");
            if (statusPanel && typeof statusPanel.getState === "function") {
              statusPanelMode = "external";
            }
            // 将找到的 DS 保存到主窗口，方便后续使用
            window._detentionSystem = DS;
            window._detentionSystemLocation = DSLocation;
            return { scriptStatus, statusPanelMode, DS, DSLocation };
          }
        }
      } catch (e) {
        // 跨域 iframe 无法访问，跳过
      }
    }
  }

  return { scriptStatus, statusPanelMode, DS, DSLocation };
}

// 执行检测
const detectionResult = detectDetentionSystem();
let scriptStatus = detectionResult.scriptStatus;
let statusPanelMode = detectionResult.statusPanelMode;
let DS = detectionResult.DS;
let DSLocation = detectionResult.DSLocation;

// 如果找到了 DS，将其保存到全局变量以便后续使用
if (DS) {
  // 为了兼容性，也尝试设置到 window.detentionSystem（如果主窗口没有）
  if (!window.detentionSystem) {
    window.detentionSystem = DS;
  }
}
