export default function Container({ children, className }){
  return (
    <div className={['container', 'mx-auto', 'max-w-7xl', 'px-4', 'sm:px-6', 'lg:px-8', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
