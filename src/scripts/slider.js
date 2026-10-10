import Splide from "@splidejs/splide";

const sliders = {
  "heroSlider": {
    "element": "hero-slider",
    "options": {
      direction: "ttb",
      autoplay: true,
      type: "loop",
      perPage: 1,
      heightRatio: 1,
      pagination: true,
      paginationDirection: "ttb",
      breakpoints: {
        1024: {
          direction: "ltr",
          arrows: false,
          pagination: false
        }
      }
    }
  },
    "pickSlider": {
    "element": "pick-slider",
    "options": {
      type: "slide",
      perPage: 7,
      perMove: 1,
      gap: "1.6rem",
      arrows: false,
      pagination: false,
      breakpoints: {
        1023: {
          perPage: 5,
          gap: "1.2rem"
        },
        767: {
          perPage: 3,
          gap: "0.8rem",
          pagination: true
        }
      }
    }
  },
  "popularSlider": {
    "element": "popular-slider",
    "options": {
      type: "loop",
      perPage: 3.5,
      perMove: 1,
      gap: "3.2rem",
      trimSpace: false,
      pagination: false,
      breakpoints: {
        1440: {
          perPage: 2.8
        },
        1152: {
          perPage: 2.2
        },
        1023: {
          perPage: 2,
          gap: "1.6rem",
          arrows: false,
          pagination: true
        },
        767: {
          gap: "1.2rem"
        }
      }
    }
  },
  "offerSlider": {
    "element": "offer-slider",
    "options": {
      type: "loop",
      perPage: 3,
      perMove: 1,
      gap: "3.2rem",
      trimSpace: false,
      pagination: false,
      breakpoints: {
        1440: {
          perPage: 2.8
        },
        1152: {
          perPage: 2.2
        },
        1023: {
          perPage: 2,
          gap: "1.6rem",
          arrows: false,
          pagination: true
        },
        767: {
          gap: "1.2rem"
        }
      }
    }
  },
  "destinationSlider": {
    "element": "destination-slider",
    "options": {
      type: "loop",
      perPage: 4,
      perMove: 1,
      gap: "3.2rem",
      trimSpace: false,
      pagination: false,
      breakpoints: {
        1023: {
          perPage: 1,
          arrows: false,
          pagination: true
        }
      }
    }
  },
  "testimonialsSlider": {
    "element": "testimonials-slider",
    "options": {
      type: "loop",
      perPage: 2.5,
      perMove: 1,
      gap: "3.2rem",
      trimSpace: false,
      pagination: false,
      breakpoints: {
        1152: {
          perPage: 3.1
        },
        1023: {
          perPage: 1.5,
          arrows: false,
          pagination: true
        },
        767: {
          perPage: 1
        }
      }
    }
  }
}

export function initSliders() {
  Object.values(sliders).forEach(({ element, options }) => {
    document.querySelectorAll(`.${element}`).forEach(wrapper => {
      const splideEl = wrapper.querySelector(".splide");
      if (splideEl) {
        new Splide(splideEl, options).mount();
      }
    });
  });
}
