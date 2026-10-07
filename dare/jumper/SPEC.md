# Jumper — Especificación Técnica v0.1

> Sistema de comunicación inalámbrica de corto y mediano alcance.  
> Diseñado como sucesor de Bluetooth: más rápido, más seguro, más eficiente.

---

## 1. Identidad del protocolo

| Campo | Valor |
|---|---|
| Nombre | **Jumper** |
| Versión inicial | 1.0 |
| Capa OSI | Física + Enlace de datos + Transporte propio |
| Paradigma | Orientado a flujos, no a conexiones fijas |
| Identificador | `JMP://[device-id]/[stream]` |

---

## 2. Capas de radio — JMP-PHY

Jumper define tres modos físicos. El dispositivo **negocia automáticamente** el modo óptimo durante el handshake inicial (≤ 1 ms).

| Modo | Banda | Throughput | Alcance | Potencia TX | Uso principal |
|---|---|---|---|---|---|
| **JMP-UWB** | 3.1–10.6 GHz | hasta 500 Mbps | 10–30 m | < 0.5 mW | Wearables, IoT, HID |
| **JMP-mmW** | 57–71 GHz (WiGig) | hasta 7 Gbps | 0.1–5 m LOS | 5–50 mW | Dock, pantallas, transferencias masivas |
| **JMP-Sub6** | 5.8 GHz ISM | hasta 200 Mbps | 5–80 m | 1–100 mW | General, móviles, audio |

```
┌──────────────────────────────────────────────────────────┐
│  Jumper PHY — selección automática                       │
├─────────────────┬────────────────────┬───────────────────┤
│  JMP-UWB        │  JMP-mmW           │  JMP-Sub6         │
│  3.1–10.6 GHz   │  57–71 GHz         │  5.8 GHz ISM      │
│  500 Mbps       │  7 Gbps            │  200 Mbps         │
│  10–30 m        │  0.1–5 m LOS       │  5–80 m           │
│  <0.5 mW        │  5–50 mW           │  1–100 mW         │
│  Wearables/IoT  │  Dock/pantallas    │  General/móviles  │
└─────────────────┴────────────────────┴───────────────────┘
```

---

## 3. Stack de protocolos

```
┌──────────────────────────────────┐
│  APP PROFILES                    │  Audio · File · HID · Video · Data
├──────────────────────────────────┤
│  JMP-SESSION                     │  Multiplexación de streams, QoS
├──────────────────────────────────┤
│  JMP-SECURE                      │  Cifrado + autenticación post-cuántica
├──────────────────────────────────┤
│  JMP-LINK                        │  Control de acceso al medio (TDMA+OFDMA)
├──────────────────────────────────┤
│  JMP-PHY (UWB / mmW / Sub6)      │  Capa física seleccionada dinámicamente
└──────────────────────────────────┘
```

---

## 4. JMP-SECURE — Seguridad

| Componente | Tecnología |
|---|---|
| Cifrado de sesión | AES-256-GCM + negociación X25519 |
| Resistencia post-cuántica | **CRYSTALS-Kyber** (KEM) para intercambio de claves |
| Firma de identidad | **CRYSTALS-Dilithium** (firma digital) |
| Autenticación de dispositivo | Certificado firmado en fábrica (Jumper Secure Identity) |
| Emparejamiento por proximidad | Rango UWB < 10 cm = auto-trust (tap-to-pair) |
| Emparejamiento biométrico | API opcional: fingerprint/face del host como confirmación |
| Rotación de claves | Por sesión + forward secrecy cada 60 s |

**Sin PIN visible al usuario** — el modelo es *tap-to-pair* o *scan*, nunca un código de 6 dígitos.

---

## 5. JMP-SESSION — Streams y QoS

| Stream ID | Tipo | Latencia garantizada | Banda reservada |
|---|---|---|---|
| `0x01` | HID (controles) | < 1 ms | mínima |
| `0x02` | Audio LL | < 2 ms | 256 kbps – 2 Mbps |
| `0x03` | Video | < 10 ms | 10–500 Mbps |
| `0x04` | File transfer | best-effort | resto del ancho de banda |
| `0xFF` | Raw / custom | configurado por app | negociado |

Un solo enlace Jumper transporta HID + audio + file transfer simultáneamente sin degradación, gracias al scheduling TDMA por stream.

---

## 6. Emparejamiento — Discovery & Handshake

```
Dispositivo A                          Dispositivo B
     │                                      │
     │── JMP-BEACON (broadcast 2.4 GHz) ──►│  anuncio pasivo, < 1 mW
     │◄─ JMP-HELLO (device-id, caps) ──────│
     │                                      │
     │── KYBER KEM encapsulation ─────────►│
     │◄─ KYBER KEM response ───────────────│
     │                                      │
     │  [shared session key establecida]    │
     │                                      │
     │── JMP-MODE-NEGOTIATE ──────────────►│  UWB / mmW / Sub6 ?
     │◄─ JMP-MODE-ACK ─────────────────────│
     │                                      │
     │  [enlace activo en < 5 ms total]     │
```

---

## 7. Compatibilidad legada — Jumper Bridge

```
[Dispositivo Bluetooth]    ──BLE──►  [Jumper Bridge]  ──JMP──►  [Host Jumper]
[Dispositivo Wi-Fi Direct] ─────────►  [Jumper Bridge]  ──JMP──►  [Host Jumper]
```

El bridge presenta al host un stream `0xB0` (legacy) con metadata del protocolo de origen.  
El usuario no ve diferencia — el host Jumper solo ve flujos JMP.

---

## 8. Consumo energético

| Modo | Potencia típica | vs. BLE |
|---|---|---|
| Standby / beacon | 0.05 mW | ≈ BLE advertising |
| JMP-UWB activo (HID) | 0.8 mW | **mejor que BLE conn** |
| JMP-UWB streaming audio | 3 mW | ~2× BLE audio |
| JMP-Sub6 transferencia | 15–80 mW | similar Wi-Fi Direct |
| JMP-mmW burst (dock) | 50–200 mW | mayor, pero de corta duración |

---

## 9. Hardware de referencia — Jumper Module v1

```
Jumper Module v1:
  ├── Radio:    UWB (DW3000-based) + 5.8 GHz transceiver
  ├── MCU:      ARM Cortex-M33, 128 MHz, TrustZone
  ├── Seguridad: Secure enclave — certificado de dispositivo + claves raíz
  ├── Antena:   Array 2×2 MIMO integrado
  ├── Interface: SPI / UART / USB 2.0 hacia host
  ├── Footprint: 10 × 12 mm
  └── SDK:      C/C++ + bindings Python / Rust / JavaScript
```

---

## 10. Perfiles de aplicación (v1.0)

| Perfil | Equivalente Bluetooth | Mejora Jumper |
|---|---|---|
| **JMP-Audio** | A2DP + LE Audio | 24-bit/96 kHz sin compresión, latencia < 2 ms |
| **JMP-HID** | HID over GATT | Round-trip < 1 ms (gaming/pro) |
| **JMP-File** | OBEX / FTP | Multi-Gbps en modo mmW |
| **JMP-Screen** | Miracast / AirPlay | Compresión adaptativa, sin driver extra |
| **JMP-Sensor** | BLE sensor profiles | Batería de años, polling configurable |
| **JMP-Mesh** | BT Mesh | Routing dinámico, hasta 128 nodos |

---

## 11. Roadmap

```
v1.0  ── JMP-UWB + JMP-Sub6
        Audio · HID · File
        Seguridad post-cuántica (Kyber + Dilithium)
        SDK C/C++

v1.5  ── JMP-mmW
        Perfiles Screen y Video
        SDK Python / Rust / JS
        Jumper Bridge (software)

v2.0  ── Mesh nativo (128 nodos)
        Jumper Bridge (hardware dongle)
        Certificación regulatoria FCC / CE
        Referencia de diseño open hardware

v2.5  ── Integración SoC — licencia IP para fabricantes
        Perfil industrial (IIoT, tiempo real determinista)
        Ecosistema de certificación de dispositivos
```

---

## 12. Diferenciadores clave vs. Bluetooth

| Característica | Bluetooth 5.4 | **Jumper 1.0** |
|---|---|---|
| Throughput máx. | 3 Mbps (EDR) / 2 Mbps (LE) | 500 Mbps – 7 Gbps |
| Latencia audio | 20–40 ms (típico) | < 2 ms garantizado |
| Latencia HID | 7–15 ms | < 1 ms |
| Criptografía | AES-128, ECDH P-256 | AES-256, Kyber (post-cuántico) |
| Emparejamiento | PIN / confirmación numérica | Tap-to-pair / biométrico |
| Multipunto | Degradación notable | Sin degradación (TDMA por stream) |
| Compatibilidad legacy | No | Sí — Jumper Bridge |
| Modo mesh | Sí (limitado) | Sí, 128 nodos, routing dinámico |

---

*Jumper — especificación preliminar — revisión 0.1 — junio 2026*
