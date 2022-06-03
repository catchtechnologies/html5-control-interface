export default class Modal {
  constructor(modalView) {
    this.modalView = modalView;
  }

  show() {
    this.modalView.style.display = "block";
  }

  hide() {
    this.modalView.style.display = "none";
  }
}
