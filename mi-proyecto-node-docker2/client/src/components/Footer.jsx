function Footer() {
  return (
    <footer className="text-muted text-center py-4 mt-5" style={{ borderTop: "1px solid #eaeaea", backgroundColor: "#fdfdfd" }}>
      <p className="mb-0 fw-semibold text-secondary">
        <i className="bi bi-bank2 me-1"></i> Banco ProyInf
      </p>
      <p className="mb-0 mt-1" style={{ fontSize: "0.80rem" }}>
        © {new Date().getFullYear()} - Grupo 14. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default Footer;
