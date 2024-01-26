var prefetch = 0;

fetch("/html/${filename}")
  .then((res) => res.json())
  .then((data) => {
    document.body.innerHTML += data.html;
    prefetch = 1;
  });
