import debounce from "./debounce.js";

export class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.dist = { finalPosition: 0, startX: 0, movement: 0 };
    this.activeClass = "active";
    this.changeEvent = new Event("changeEvent");
  }

  transition(active) {
    this.slide.style.transition = active ? "transform .3s" : "";
  }

  moveSlide(distX) {
    this.dist.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
  }

  updatePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6;
    return this.dist.finalPosition - this.dist.movement;
  }

  onStart(event) {
    let moveType;
    if (event.type === "mousedown") {
      event.preventDefault();
      this.dist.startX = event.clientX;
      moveType = "mousemove";
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      moveType = "touchmove";
    }
    this.wrapper.addEventListener(moveType, this.onMove);
    this.transition(false);
  }

  onMove(event) {
    const positionTap =
      event.type === "mousemove"
        ? event.clientX
        : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(positionTap);
    this.transition(true);
    this.moveSlide(finalPosition);
  }

  onEnd(event) {
    const moveType = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.wrapper.removeEventListener(moveType, this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
    this.changeSlideMovement();
  }

  changeSlideMovement() {
    if (this.dist.movement > 120 && this.index.next !== null) {
      this.activeNextSlide();
    } else if (this.dist.movement < -120 && this.index.prev !== null) {
      this.activePrevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
  }

  activeNextSlide() {
    if (this.index.next !== null) this.changeSlide(this.index.next);
  }

  activePrevSlide() {
    if (this.index.prev !== null) this.changeSlide(this.index.prev);
  }
  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }

  // slide config

  slideIndexNav(index) {
    const last = this.slideArray.length - 1;

    this.index = {
      prev: index ? index - 1 : null,
      active: index,
      next: index === last ? null : index + 1,
    };
  }

  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    this.slideIndexNav(index);
    this.dist.finalPosition = activeSlide.position;
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  slidePosition(item) {
    const margin = (this.wrapper.offsetWidth - item.offsetWidth) / 2;

    return -(item.offsetLeft - margin);
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map((slide) => {
      const position = this.slidePosition(slide);

      return {
        position,
        slide,
      };
    });
  }

  changeActiveClass() {
    this.slideArray.forEach((item) =>
      item.slide.classList.remove(this.activeClass)
    );
    this.slideArray[this.index.active].slide.classList.add(this.activeClass);
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 1000);
  }

  addResizeEvent() {
    window.addEventListener("resize", this.onResize);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);
    this.onResize = debounce(this.onResize.bind(this), 200);
  }

  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvents();
    this.slidesConfig();
    this.addResizeEvent();
    this.changeSlide(0);
    return this;
  }
}

export class SlideNav extends Slide {
  constructor(slide, wrapper) {
    super(slide, wrapper);

    this.bindControl();
  }

  addArrowNav(prev, next) {
    this.prev = document.querySelector(prev);
    this.next = document.querySelector(next);
    this.addEventArrows();
  }

  addEventArrows() {
    this.prev.addEventListener("click", this.activePrevSlide);
    this.next.addEventListener("click", this.activeNextSlide);
  }

  createElementControl() {
    const control = document.createElement("ul");
    control.dataset.control = "slide";
    this.slideArray.forEach((item, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}">${
        index + 1
      }</a></li>`;
    });

    this.wrapper.appendChild(control);
    return control;
  }

  eventControl(item, index) {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      this.changeSlide(index);
    });

    this.wrapper.addEventListener("changeEvent", this.activeControlItem);
  }

  addEventControl(customControl) {
    this.control =
      document.querySelector(customControl) || this.createElementControl();

    this.arrayControl = [...this.control.children];
    this.arrayControl.forEach((item, index) => this.eventControl(item, index));
  }

  activeControlItem() {
    this.arrayControl.forEach((item) =>
      item.classList.remove(this.activeClass)
    );

    this.arrayControl[this.index.active].classList.add(this.activeClass);
  }

  bindControl() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
