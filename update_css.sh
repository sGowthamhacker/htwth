#!/bin/bash
sed -i '/@keyframes shimmer-slide/,$d' index.css
cat << 'INNER_EOF' >> index.css
@keyframes shimmer-slide {
  0% { transform: translateX(-150%); }
  100% { transform: translateX(150%); }
}
.animate-shimmer-slide {
  animation: shimmer-slide 2.5s infinite;
}
INNER_EOF
