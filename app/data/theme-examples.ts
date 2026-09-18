// Example questions for each curated answer (executiveThemes in graphrag-engine.ts), phrased the way a
// visitor asks rather than the way the answer is written. A question is matched against these by
// meaning (question-to-question similarity is far sharper than question-to-document), and a theme's
// score is its best example. Keys are theme titles: renaming a theme without updating its key fails
// `npm run build:semantic`, and the site build fails until the index is rebuilt.
//
// When a visitor question misses its answer, add a question like it here, run `npm run build:semantic`,
// and the routing eval (scripts/ask-routing-eval.json) confirms nothing else broke. Never copy an eval
// question in here: the eval would then be grading its own answers.
export const THEME_EXAMPLES: Record<string, string[]> = {
  'Goertzel Recurrence vs. 8 MB FFT for Broken Rotor Bar Detection': [
    'How does DG32 detect a broken rotor bar in an induction motor?',
    'Why use Goertzel instead of a full FFT for motor current analysis?',
    'Can the chip find rotor faults without a large frequency analysis buffer?',
    'How much memory does rotor bar fault detection need on DG32?',
    'How are the sidebands around the supply frequency tracked?',
  ],
  'The Kurtosis Non-Monotonicity Trap in Bearing Health Alarms': [
    'Why does kurtosis not keep rising as a bearing gets worse?',
    'What goes wrong if bearing alarms rely only on kurtosis?',
    'Which vibration statistics should trigger a bearing health alarm?',
    'Why do bearing fault indicators fall again late in the damage?',
    'How should vibration alarms combine RMS and peakiness?',
  ],
  'DG32-LITE AI Compute Envelope (No Accelerator)': [
    'What AI workloads can DG32-LITE run on its own CPU?',
    'How fast is inference on the scalar core without an NPU?',
    'Does DG32-LITE need a neural accelerator for edge AI?',
    'How many multiply-accumulates per second can the base core do?',
    'What model sizes fit on the chip without dedicated AI hardware?',
  ],
  '30 Industrial Diagnostics & Observers on a 50 MHz Scalar Core': [
    'What industrial use cases does DG32 support?',
    'Which predictive maintenance applications run on the chip?',
    'List the edge diagnostics DG32 can perform in a plant.',
    'What condition monitoring tasks fit on a 50 MHz controller?',
    'Where would a factory deploy DG32 for machine health?',
  ],
  'Academic Benchmark Audit: CWRU Bearing Dataset Leakage': [
    'Is the CWRU bearing dataset reliable for benchmarking?',
    'Why are academic bearing fault results often overstated?',
    'What is data leakage in bearing fault classification studies?',
    'How should vibration datasets be split to avoid inflated accuracy?',
    'Can published fault detection accuracies be trusted?',
  ],
  'DAP-2020 Buy (Indian-IDDM) & Make-II Statutory Defence Moats': [
    'Is DG32 eligible under India’s defence acquisition procedure?',
    'What domestic content does DeepGrid silicon offer defence buyers?',
    'How does DG32 fit Make-II defence procurement?',
    'Does DeepGrid qualify as an indigenous supplier to the armed forces?',
    'Which Indian procurement rules favour DeepGrid chips?',
  ],
  'Hardware DShot Receive (dgrid_dshot_rx) & Zero-Jitter Motor Telemetry': [
    'How does DG32 handle ESC throttle signals from a drone flight controller?',
    'Does the chip support bidirectional telemetry for drone motors?',
    'How is motor speed reported back to the flight controller?',
    'Is the drone ESC protocol decoded in hardware or software?',
    'What makes the ESC command decoding jitter-free?',
  ],
  '50 MHz Operating Frequency: Lockstep Margin & Physical Timing Closure': [
    'Why does DG32 run at 50 MHz and not faster?',
    'What limits the maximum clock frequency of the chip?',
    'How much timing margin does the 50 MHz clock leave?',
    'Could DG32 be clocked higher?',
    'What is the fmax of the lockstep core?',
  ],
  'DG32 vs. STM32G0: Hardware Lockstep, BOM Cost & Latency Benchmark': [
    'How is DG32 different from an STM32G0?',
    'Why choose DG32 over an existing ST microcontroller?',
    'What does DG32 cost compared with incumbent motor-control MCUs?',
    'Does the STM32G0 have hardware lockstep like DG32?',
    'Compare DG32 against the market-leading entry-level MCU.',
  ],
  '₹10 Cr Capital Waterfall & 24-Month Seed Runway': [
    'How much funding is DeepGrid raising?',
    'What will the seed investment be used for?',
    'How long is the company’s cash runway?',
    'How is the capital split between tape-out and team?',
    'What does the funding plan look like over two years?',
  ],
  'Chinese Price Crash Stress Test & Operational Stop Rules S1–S4': [
    'What if Chinese suppliers undercut DeepGrid on price?',
    'What are DeepGrid’s stop rules if the business case fails?',
    'How does the plan hold up under a price war?',
    'When would DeepGrid abandon or change course?',
    'What downside scenarios has the company stress-tested?',
  ],
  'DG32 64-Pin QFN Physical Pin Map & Packaging Specification': [
    'What is the pinout of the DG32 package?',
    'Where are the PWM and ADC pins on the chip?',
    'What package does DG32 come in?',
    'How are the supply and ground pins arranged on the QFN?',
    'What does the exposed thermal pad connect to?',
  ],
  'Sovereign Supply Chain Immunity: The Three-Factory & 100% Domestic Architecture': [
    'What happens to supply if one foundry becomes unavailable?',
    'Is DeepGrid dependent on Taiwanese fabs?',
    'How resilient is DeepGrid’s manufacturing to export controls?',
    'Can DG32 be made entirely in India?',
    'Which foundries can manufacture DeepGrid chips?',
  ],
  'Hardware Lockstep: How DG32 Catches a Faulty Computation': [
    'How does DG32 detect a CPU fault while the motor is running?',
    'What happens when the two cores disagree?',
    'How quickly does the chip shut the power stage down after an error?',
    'Why does an entry-level MCU need a second checking core?',
    'What is the FAULT_N output used for?',
  ],
};
