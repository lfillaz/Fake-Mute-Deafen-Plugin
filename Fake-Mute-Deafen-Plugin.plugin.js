/**
 * @name G1Plus
 * @description Adds an On/Off button next to the mic mute button in Discord calls to toggle the Fake Deaf feature.
 * @version 0.5.0
 * @author lfillaz
 */

module.exports = class G1Plus {
  fakeDeafEnabled = false;
  toggleButton = null;

  load() {
    this.addToggleButton();
    this.overrideWebSocket();
  }

  addToggleButton() {
    
    this.toggleButton = document.createElement('div');
    this.toggleButton.style.position = 'absolute';
    this.toggleButton.style.bottom = '14px';
    this.toggleButton.style.left = '117px';  
    this.toggleButton.style.width = '24px';
    this.toggleButton.style.height = '24px';
    this.toggleButton.style.borderRadius = '50%';
    this.toggleButton.style.backgroundColor = this.fakeDeafEnabled ? 'green' : 'red';
    this.toggleButton.style.border = '2px solid #333';
    this.toggleButton.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
    this.toggleButton.style.cursor = 'pointer';
    this.toggleButton.style.transition = 'all 0.3s ease';
    this.toggleButton.style.display = 'flex';
    this.toggleButton.style.alignItems = 'center';
    this.toggleButton.style.justifyContent = 'center';
    this.toggleButton.title = 'Toggle Fake Deaf (by lfillaz)';
    
    
    const icon = document.createElement('span');
    icon.style.color = 'white';
    icon.style.fontSize = '14px';
    icon.style.fontWeight = 'bold';
    icon.innerText = this.fakeDeafEnabled ? '🔊' : '🔇';
    this.toggleButton.appendChild(icon);

   
    this.toggleButton.onmouseover = () => {
      this.toggleButton.style.boxShadow = '0px 6px 12px rgba(0, 0, 0, 0.3)';
    };
    this.toggleButton.onmouseout = () => {
      this.toggleButton.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
    };

    this.toggleButton.onclick = () => this.toggleFakeDeaf(icon);
    
    
    const controlsContainer = document.querySelector('[aria-label="Mute"]');
    if (controlsContainer) controlsContainer.parentNode.insertBefore(this.toggleButton, controlsContainer.nextSibling);
  }

  toggleFakeDeaf(icon) {
    this.fakeDeafEnabled = !this.fakeDeafEnabled;
    this.toggleButton.style.backgroundColor = this.fakeDeafEnabled ? 'green' : 'red';
    icon.innerText = this.fakeDeafEnabled ? '🔊' : '🔇';
    BdApi.showToast(`Fake Deaf feature is now ${this.fakeDeafEnabled ? 'enabled' : 'disabled'}.`, {
      type: this.fakeDeafEnabled ? 'success' : 'error'
    });
  }

  overrideWebSocket() {
    let apply_handle = {
      apply: (target, thisArg, args) => {
        if (!this.fakeDeafEnabled) return target.apply(thisArg, args);
        let data = args[0];
        if (data.toString() === '[object ArrayBuffer]') {
          let dec = new TextDecoder('utf-8').decode(data);
          if (dec.includes('self_deaf')) {
            dec = dec.replace('self_mutes\u0005false', 'self_mutes\u0004true');
            dec = dec.replace('self_deafs\u0005false', 'self_deafs\u0004true');
            data = new TextEncoder('utf-8').encode(dec).buffer.slice(2);
          }
        }
        return target.apply(thisArg, [data]);
      }
    };
    WebSocket.prototype.send = new Proxy(WebSocket.prototype.send, apply_handle);
  }

  start() {
    this.fakeDeafEnabled = true;
    BdApi.showToast('Fake Deaf feature started.');
  }

  stop() {
    this.fakeDeafEnabled = false;
    if (this.toggleButton) this.toggleButton.remove();
    this.toggleButton = null;
    BdApi.showToast('Fake Deaf feature stopped.');
  }
};
