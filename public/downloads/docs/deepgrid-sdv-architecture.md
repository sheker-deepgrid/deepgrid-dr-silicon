# DeepGrid Software-Defined Vehicle (DG SDV) Platform Architecture Specification

**System**: DG SDV Central Zonal Compute Platform Reference Architecture  
**Classification**: Sovereign Automotive & Defense Hardware Platform  
**Author**: DeepGrid Semi Pvt Ltd · Hyderabad, India  
**Target Standards**: ISO 26262 ASIL-D, IEC 61508 SIL-3, EVITA-Full, IEEE 802.1Qbv TSN, AEC-Q100 Grade 0  
**Generated Via**: `/architecture-to-everything` compounded with `/deepgrid-mature-silicon`

---

## 1. Architectural Thesis & Sovereign Automotive Context

### 1.1 The Centralized Zonal Computing Transition
Modern commercial and military vehicles are transitioning from 80+ fragmented, low-end Electronic Control Units (ECUs) wired across kilometers of copper harnesses to a **Zonal Architecture**: 4 to 6 high-performance Zonal Controllers aggregating local sensors, smart electronic fusing, and actuators, reporting back to a central Software-Defined Vehicle (SDV) compute hub.

Dominant foreign incumbents (NXP S32G, Infineon Aurix TC4x, Renesas R-Car, ST Stellar) impose high licensing costs, proprietary tooling ecosystems, and foreign supply chain vulnerabilities. DeepGrid's **DG SDV Platform** provides an open, sovereign RISC-V compute architecture combining:
1. **ASIL-D Triple-Modular Redundancy (TMR)**: Zero-jitter deterministic execution for steer-by-wire and brake-by-wire chassis safety.
2. **EVITA-Full Hardware Security Module (HSM)**: Cryptographic isolation preventing remote vehicle hijacking over cellular/V2X.
3. **64-bit Coherent AXI4 Matrix with AXI-REALM Quality-of-Service**: Guarantees real-time safety packets are never starved by high-bandwidth Linux OS telemetry.
4. **Zonal I/O & Solid-State Power**: Gigabit TSN Ethernet, CAN-XL, and 16 integrated smart e-Fuses replacing electromechanical relays.

---

## 2. Multi-Domain Silicon Architecture

```
+---------------------------------------------------------------------------------------+
| DG SDV PLATFORM REFERENCE DOMAINS                                                     |
+=======================================================================================+
| 1. DG SECURE DOMAIN (EVITA-Full / EAL5+):                                              |
|    Dual-Lockstep DGI-RV32 | Crypto DSAs (AES/SHA/SM4) | OTP eFuse | Isolated AON Power |
+---------------------------------------------------------------------------------------+
| 2. DG SAFE DOMAIN (ISO 26262 ASIL-D / SIL-3):                                         |
|    Triple-Core Lockstep (TMR) DGCV32-RT | 2-Cycle Skew Voter | Private ISPM/DSPM ECC   |
+---------------------------------------------------------------------------------------+
| 3. DG HOST DOMAIN (POSIX / Linux ASIL-B):                                             |
|    Multi-Core 64-bit RV64GCH (DGCVA6RT) | MMU | Hardware FPU | 1MB Coherent L2 Cache   |
+=======================================================================================+
| 4. SYSTEM INTERCONNECT: 64-bit Coherent AXI4 Matrix @ 400 MHz (>50 GB/s)              |
|    *REGULATED BY AXI-REALM DETERMINISTIC LATENCY & BANDWIDTH MONITOR*                 |
+=======================================================================================+
| 5. HETEROGENEOUS ACCELERATORS:                                                        |
|    DG RVV 1.0 Vector Core (512-bit) | 4x Integer DGCV32 | 512 KB Interleaved TCDM SRAM |
+---------------------------------------------------------------------------------------+
| 6. ZONAL I/O & SMART ACTUATION (SKU-9):                                               |
|    Gigabit TSN Switch (IEEE 802.1Qbv) | 4x CAN-XL (20 Mbps) | 16x Smart 48V/12V e-Fuses |
+---------------------------------------------------------------------------------------+
```

---

## 3. Detailed Subsystem Specifications

### 3.1 DG Safe Domain (Triple-Core Lockstep TMR)
- **Cores**: 3x identical DGCV32-RT 32-bit RISC-V safety processors running at 300 MHz.
- **Microarchitecture**: 6-stage in-order pipeline executing from private tightly-coupled Instruction Scratchpad Memory (ISPM) and Data Scratchpad Memory (DSPM) protected by Single-Error Correction Double-Error Detection (SECDED) ECC.
- **Temporal Skew**: Core 0 runs at cycle $T$, Core 1 at $T+1$, and Core 2 at $T+2$. This temporal stagger ensures that high-energy EMI bursts or power supply ripple cannot induce identical transient faults across all three cores.
- **Majority Voting Unit**: Hardware voter compares all bus transactions and register commit states. If any single core deviates, the voter masks the error and continues normal execution without interruption while latching diagnostic telemetry in the Fault Collection & Control Unit (FCCU). Latching latency is $\le 2$ clock cycles.

### 3.2 AXI-REALM Quality-of-Service Interconnect
The central bus fabric is a 64-bit non-blocking AXI4 crossbar operating at 400 MHz. To prevent non-critical tasks (such as Linux host file transfers or video logging) from stalling critical safety transactions, DeepGrid implemented **AXI-REALM**:
- **Bandwidth Credit Shaper**: Each master is provisioned a static credit allocation per time epoch ($250\ \mu\text{s}$).
- **Hardware Priority Arbiter**: Transactions from the ASIL-D Safe Domain bypass the queue with zero arbitration delay ($<2.5\text{ ns}$).
- **Bounded Latency Proof**: Worst-Case Response Time (WCRT) for chassis control packets across the matrix is mathematically bounded to $\le 12.5\text{ ns}$.

### 3.3 DG Secure Domain (EVITA-Full Root-of-Trust)
- **Isolated Power Enclave**: Operates on a dedicated internal LDO and independent clock network with side-channel DPA/SPA hardening.
- **Hardware Crypto Accelerators**: Direct execution of AES-256 (GCM/CBC), SHA-3/512, SM4, and ECDSA/Ed25519 for secure boot and V2X certificate verification.
- **Secure Key Storage**: 32 KB on-chip One-Time Programmable (OTP) eFuse matrix storing factory root keys, hardware device IDs, and rollback counters.

### 3.4 Zonal Vehicle I/O & Solid-State Electronic Fuses (SKU-9 Integration)
- **Gigabit TSN Switch**: 4-port Ethernet switch complying with IEEE 802.1Qbv Time-Aware Shapers, ensuring scheduled transmission slots for critical ADAS radar/lidar streams.
- **CAN-XL Transceivers**: 4 dedicated CAN-XL controllers providing up to 20 Mbps data rates with 2048-byte payloads, replacing legacy CAN-FD.
- **16x Smart Electronic Fuses (e-Fuses)**: Integrated 130nm BCD power switches capable of handling 48V and 12V zonal branches up to 25A continuous per channel. Provides $I^2t$ thermal trip modeling, real-time current sensing, and sub-microsecond short-circuit shutoff, eliminating physical fuse boxes.

---

## 4. Multi-Die System-in-Package Composition

| Component Die | Technology & Foundry | Packaging Attachment | Function in SDV |
|---|---|---|---|
| **Central Compute & Crossbar** | 28 nm CMOS | Flip-Chip Copper Pillar | Multi-Core RV64 Linux + Accelerators |
| **ASIL-D Safe Island** | 130 nm CMOS (SkyWater / SCL) | Wire-Bonded Mature Die | Triple-Lockstep TMR Safety Core |
| **Zonal Power & e-Fuses** | 180 nm BCD | Wire-Bonded HV Die | 16x 48V/12V Smart Solid-State Fuses |
| **SKU-3 Hi-Rel PMIC** | 180 nm BCD | Wire-Bonded Mature Die | Central Automotive Power Delivery |
| **SKU-5/9 Transceivers** | 130 nm HV Thick-Oxide | Wire-Bonded Mature Die | CAN-XL, CAN-FD, LIN, FlexRay PHYs |

---

## 5. Defense & Commercial Automotive Moats

1. **Elimination of ARM & Proprietary IP Royalties**: Slashes recurring per-chassis silicon royalties to zero while providing Indian OEMs (Tata Motors, Ashok Leyland, Mahindra) with source-level RTL inspectability.
2. **DAP-2020 IDDM Compliance for Military Logistics**: Standardizes military tactical trucks (ALS, Stallion) and armored recovery vehicles onto a common sovereign compute spine.
3. **AEC-Q100 Grade 0 Qualification**: Operating temperature range from $-40^\circ\text{C}$ to $+150^\circ\text{C}$ junction temperature, ensuring survivability under desert bonnet conditions.
