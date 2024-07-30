var prefetch = 0;

fetch("/html/${filename}")
  .then((res) => res.text())
  .then((data) => {
    document.body.innerHTML += data;
    prefetch = 1;
  });
