export const Sidemenu = () => {
  return (
    <div className="sidemenu">
      <div className="sidemenu-item">Информация</div>
      {[...Array(8)].map((_, index) => (
        <div key={index} className="sidemenu-item">
          Элемент {index + 1}
        </div>
      ))}
    </div>
  );
};