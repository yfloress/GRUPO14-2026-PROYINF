from unittest import TestCase, main 
from requests import post           

class TestScoringSystem(TestCase):   
    @classmethod
    def setUpClass(cls):
        """Configuración inicial para los tests """
        cls.base_url = "http://localhost:3000/api/scoring"
        cls.payload_base = {
            "rut": "12345678-9",
            "nombre": "Juan",
            "apellido_paterno": "Perez",
            "apellido_materno": "Gomez",
            "edad": 30,
            "sistema_salud": "Fonasa",
            "tipo_vivienda": "Propia",
            "ingreso_mensual": 1200000,
            "deuda_mensual": 200000,
            "condicion_laboral": "Indefinido",
            "antiguedad_meses": 36,
            "integrantes_hogar": 3,
            "nivel_educacional": "Universitario",
            "mora_mas_larga_24m": 0,
            "pagos_puntuales_12m": 12,
            "creditos_cerrados_sin_mora": 2,
            "consultas_credito_recientes": 1,
            "antiguedad_crediticia_anios": 7,
            "uso_tarjeta_pct": 20.0,
            "tipo_pago_tarjeta": "Total",
            "kyc_verificado": True,
            "debe_pension_alimenticia": False,
            "puntaje": 850,
            "nivel": "Platino",
            "motivo": "Excelente perfil financiero"
        }

    def test_hu003_rut_formato_invalido(self):
        """Caso 03: HU003 - Clase de Equivalencia: RUT con formato inválido"""
        data = self.payload_base.copy()
        data["rut"] = "hsadh"  # Formato que no debe ser aceptado (mas corto, sin numeros ni digito verificador)
        response = post(self.base_url, json=data)
        self.assertEqual(response.status_code, 400, "El sistema acepto rut con formato malo")

    def test_hu003_evaluacion_riesgo_excepcional(self):
        """Caso 02: HU003 - Resultado Excepcional [cite: 19, 27]"""
        data = self.payload_base.copy()
        data["rut"] = None 
        response = post(self.base_url, json=data)
        self.assertEqual(response.status_code, 500, "El sistema acepto rut vacio")
        self.assertFalse(response.json()['ok'])

    @classmethod
    def tearDownClass(cls):
        """Limpieza de datos """
        print("\n[INFO] Pruebas finalizadas.")

if __name__ == "__main__":
    main()