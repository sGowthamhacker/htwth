(function(w,d,s,u,a,b){
  w['Median']=w['Median']||function(){(w['Median'].q=w['Median'].q||[]).push(arguments)};
  a=d.createElement(s);b=d.getElementsByTagName(s)[0];a.async=1;a.src=u;b.parentNode.insertBefore(a,b);
})(window,document,'script','https://median.co/sdk.js');
// IMPORTANT: Replace 'YOUR-MEDIAN-ID-HERE' with your actual Median.co ID
if (typeof window.Median === 'function') {
  window.Median('init', 'YOUR-MEDIAN-ID-HERE');
}
