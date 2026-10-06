import { useEffect, useState } from "react";

/*
 * Types a list of phrases one after another (type → hold → delete → next).
 * Returns the text currently visible. Restarts when the phrases change
 * (for example when the language changes).
 */
export default function useTypewriter(phrases, { type = 55, erase = 28, hold = 1700, loop = true } = {}) {
  const [text, setText] = useState("");
  const key = phrases.join("|");

  useEffect(() => {
    let index = 0;
    let char = 0;
    let deleting = false;
    let timer;
    setText("");

    const tick = () => {
      const phrase = phrases[index];
      if (!deleting) {
        char += 1;
        setText(phrase.slice(0, char));
        if (char === phrase.length) {
          if (!loop && index === phrases.length - 1) return;
          deleting = true;
          timer = setTimeout(tick, hold);
          return;
        }
        timer = setTimeout(tick, type + Math.random() * 40);
      } else {
        char -= 1;
        setText(phrase.slice(0, char));
        if (char === 0) {
          deleting = false;
          index = (index + 1) % phrases.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, erase);
      }
    };

    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return text;
}
