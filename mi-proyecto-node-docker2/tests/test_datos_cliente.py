from unittest import TestCase, main
from requests import post

class TestDatosCliente(TestCase):
    @classmethod
    def setUpClass(cls):
        """Configuración inicial para los tests de HU013"""
        cls.base_url = "http://localhost:3000/api/datos-cliente"
        cls.payload_base = {
            "rut_cliente": "12345678-9",
            "renta_mensual": 1500000,
            "antiguedad_empresa_meses": 24,
            "condicion_laboral": "dependiente",
            "tipo_contrato": "indefinido",
            "deuda_mensual": 100000,
            "integrantes_hogar": 2
        }

    def test_hu013_actualizacion_datos_validos(self):
        """Caso 03: HU013 - Clase de Equivalencia: Datos válidos (flujo normal)"""
        response = post(self.base_url, json=self.payload_base)
        self.assertEqual(response.status_code, 200, "El sistema rechazó datos válidos")
        self.assertTrue(response.json().get('ok'), "La respuesta no fue exitosa")

    def test_hu013_renta_invalida_frontera(self):
        """Caso 04: HU013 - Valor Frontera: Renta mensual igual a 0"""
        data = self.payload_base.copy()
        data["renta_mensual"] = 0
        response = post(self.base_url, json=data)
        self.assertEqual(response.status_code, 400, "El sistema aceptó renta igual a 0")
        self.assertFalse(response.json().get('ok'))
        self.assertIn("Faltan datos obligatorios", response.json().get('error', ''))

    @classmethod
    def tearDownClass(cls):
        """Limpieza de datos"""
        print("\n[INFO] Pruebas de Datos Cliente finalizadas.")

if __name__ == "__main__":
    main()
