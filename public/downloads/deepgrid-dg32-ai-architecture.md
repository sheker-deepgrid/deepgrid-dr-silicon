# DG32-LITE Edge AI & Predictive Diagnostics System Architecture

## 1. Executive Thesis: AI on a 50 MHz Scalar Core Without an Attention Engine
The DG32-LITE microcontroller proves that high-accuracy industrial condition monitoring and predictive diagnostics do not require heavy transformer acceleration or multi-watt NPU arrays. By exploiting the architectural inversion that comparisons and table lookups cost almost nothing on an integer CPU, tree ensembles (Random Forests, Gradient Boosting) achieve parity with deep learning (95.6% vs. 97–100% on CWRU bearing benchmarks) while requiring **zero multiplications** and running 50–500× faster.

---

## 2. The Physical Compute & Memory Envelope

| Parameter | Specification | Physical Constraint / Origin |
|---|---|---|
| **CPU Architecture** | Dual-Core Lockstep RV32IM | 130 nm CMOS · Single 50 MHz Domain |
| **Scalar Compute Rate** | 12.5 MMAC/s (int8) | Back-solved from 50 MHz @ 4 cycles/MAC |
| **Model Memory Budget** | 16.5 KB SRAM (29.5 KB with Mask ROM) | Weights + peak activation buffer |
| **FOC Loop Cycle Load** | ~300 Hardware Cycles (~6 µs) | Hardware CORDIC, Clarke/Park, PWM |
| **Available Diagnostic Headroom** | **82% of Core Clock Cycles** | At 10 kHz Field-Oriented Control rate |
| **Hardware Math Unit** | CORDIC (sin, cos, atan2, magnitude) | 20 iterations, 120 cycles total |
| **Worst-Case Latency** | 10.24 ms (1D-CNN 8/16/32) | 24 of 30 use cases run >1 kHz |

---

## 3. Four-Tier Model Hierarchy & Cycle Costs

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                   DG32-LITE SCALAR ALGORITHM EXECUTION HIERARCHY                         │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ Tier 1 (First Choice): Zero-Multiply Trees & Discriminants                               │
│ • Random Forest (100×d8): 3,200 cycles | 0.06 ms | 20 KB RAM | >1 kHz                   │
│ • Gradient Boosted Trees (200×d4): 3,200 cycles | 0.06 ms | 12 KB RAM | >1 kHz          │
│ • Linear Discriminant Analysis (LDA): 128 cycles | <0.01 ms | 0.7 KB RAM | >1 kHz        │
│                                                                                          │
│ Tier 2: Regime Identification & Distance Metrics                                         │
│ • Mahalanobis Distance: 4,096 cycles | 0.08 ms | 2 KB RAM | >1 kHz                      │
│ • Extended Kalman Filter (EKF): 2,400 cycles | 0.05 ms | 2 KB RAM | >1 kHz              │
│ • One-Class SVM (Kernel Boundary): 12,800 cycles | 0.26 ms | 6.9 KB RAM | >1 kHz        │
│ • Gaussian Mixture Model (GMM) + 8-State HMM: 3,072 cycles | 0.06 ms | 2 KB RAM          │
│                                                                                          │
│ Tier 3 (Upper Ceiling): Small Dense Networks & Sequences                                 │
│ • MLP 32-16-8-4 (Cogging / Battery): 2,688 cycles | 0.05 ms | 0.7 KB RAM | >1 kHz       │
│ • MLP Autoencoder (Drift Manifold): 22,016 cycles | 0.44 ms | 5.5 KB RAM | >1 kHz       │
│ • GRU Sequence Model (16 units): 147,456 cycles | 2.95 ms | 1.6 KB RAM | 270 Hz         │
│ • 1D-CNN (8/16/32 raw waveform): 512,000 cycles | 10.24 ms | 14 KB RAM | 80 Hz          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Signal Processing & AFE Binding Constraints

### 4.1 AFE Dynamic Range Limit ($D = 6(N-1)$ dB)
Per ISO 13373-2, an 8-bit analog-to-digital converter delivers only 42 dB of usable dynamic range. However, motor current signature analysis (MCSA) broken rotor bar sidebands sit **-40 to -60 dBc below the fundamental**. 
- On an 8-bit converter, the entire defect signal disappears beneath the quantization noise floor.
- **Hardware Requirement:** DG32-LITE systems mandate either active analog fundamental notch filtering ahead of the converter, or a 12-to-16-bit synchronized ADC.

### 4.2 Goertzel Recurrence vs. 8 MB FFT
Resolving motor slip sidebands separated by $2 \cdot s \cdot f_1 \approx 0.5\text{–}3\text{ Hz}$ requires records of 30–100 seconds at 0.01–0.05 Hz resolution. A standard $2^{20}$-point FFT would require 8 Megabytes of RAM. DG32-LITE deploys an 8-bin Goertzel recurrence filter evaluated strictly at the predicted physical sideband frequencies, requiring only **6,144 cycles (0.12 ms) and 0.7 KB RAM**.

### 4.3 The Kurtosis Non-Monotonicity Trap
- **Kurtosis:** Sensitive to incipient localized spalls; spikes dramatically upon defect initiation, but drops back toward Gaussian baselines ($K \approx 3.0$) as damage generalizes across the raceway.
- **RMS Velocity:** Monotonic and stable as vibration severity rises, but completely blind to early localized micro-cracks.
- **DG32 Rule:** Trend both continuously; **never alarm or trip on kurtosis alone**.

---

## 5. Safety Architecture & Advisory Boundary (ISO 26262 ASIL-D)

```
 [ SENSORS: ACCEL + CSAS ]
            │
            ▼
 [ CORDIC + DSP FRONT-END ]
            │
            ▼
 [ ML DIAGNOSTIC CLASSIFIER ] (Advisory Role Only)
            │
            ▼ (Advisory Health Metric)
 ┌──────────────────────────────────────────────────────────────┐
 │ HARDWARE SAFETY ISOLATION GATE                               │
 │ • Dual-Core Lockstep Supervisor (2-Cycle Skew)               │
 │ • Independent Hardware Trip Registers (Overtemp, Current)     │
 │ • Deterministic ASIL-D Interlock Asserting FAULTn in <2 Clks │
 └──────────────────────────────────────────────────────────────┘
            │
            ▼
 [ INVERTER DISCONNECT / FAULT PIN ]
```

1. **Strict Advisory Role:** Machine learning classifiers and neural networks operate in an **advisory and predictive role only**. They provide pre-fault warning telemetry and service recommendations over CAN-FD.
2. **Deterministic Tripping:** All hard trip limits (overcurrent, overvoltage, phase loss, dead-time violation, locked rotor) are held by the secondary lockstepped hardware comparator core and assert `FAULTn` within **2 clock cycles** (<40 ns), entirely bypassing firmware and inference code.
3. **CWRU Data Leakage Mitigation:** Academic benchmarks claiming 99% accuracy are discarded due to temporal and record-splitting data leakage. DG32-LITE models are calibrated against realistic physical bearing baselines of **65%–80% accuracy** on unseen industrial machinery.
