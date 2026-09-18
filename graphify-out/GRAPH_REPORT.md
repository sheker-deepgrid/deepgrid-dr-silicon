# Graph Report - deepgrid-dr-site  (2026-09-18)

## Corpus Check
- Large corpus: 296 files · ~1,420,340 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1037 nodes · 1803 edges · 72 communities (65 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 62,500 input · 21,000 output

## Community Hubs (Navigation)
- Silicon Benchmarks & Scorecards
- Sovereign Supply & Defence Moats
- Input.tsx Input()
- @cloudflare/vite-plugin @cloudflare/workers-types
- @base-ui/react Class-variance-authority
- Dropdown-menu.tsx Dropdownmenu()
- Aspect-ratio.tsx Aspectratio()
- @cloudflare/workers-types Dom.iterable
- Content.ts Applications
- GraphRAG & Council Intelligence
- Components.json Aliases
- GraphRAG & Council Intelligence
- Command.tsx Command()
- Rules Import/no-anonymous-default-export
- Devices.tsx Count
- Button-group.tsx Buttongroup()
- Dual-Domain & Co-Processor
- Combobox.tsx Comboboxchip()
- Context-menu.tsx Contextmenu()
- Drawer.tsx Drawer()
- Silicon Benchmarks & Scorecards
- GraphRAG & Council Intelligence
- Carousel.tsx Carousel()
- Field.tsx Field()
- GraphRAG & Council Intelligence
- Groundeddocumentshub() Library.tsx
- Alert-dialog.tsx Alertdialog()
- Button.tsx Button()
- Chart.tsx Chartconfig
- Toast.tsx Toast
- Silicon Benchmarks & Scorecards
- Attachment.tsx Attachment()
- Silicon Benchmarks & Scorecards
- Input-group.tsx Inputgroup()
- .oxfmtrc.json Ignorepatterns
- Package-pages.mjs Appsource
- Dual-Domain & Co-Processor
- Deepgridcatalog Deepgriditem
- Navigation-menu.tsx Navigationmenu()
- Edge AI & Diagnostics
- Verify-site.mjs Errors
- Pagination.tsx Pagination()
- Sovereign Supply & Defence Moats
- Empty.tsx Empty()
- Dual-Domain & Co-Processor
- Ignorepatterns Next-env.d.ts
- Plugins Eslint
- Narrate_kokoro.py Main()
- App-card.tsx Appcard()
- Dual-Domain & Co-Processor
- Avatar.tsx Avatar()
- Bubble.tsx Bubble()
- Message.tsx Message()
- Popover.tsx Popover()
- Toggle.tsx Toggle-group.tsx
- .oxlintrc.json Categories
- Main() Check_narration.py
- Layout.tsx Metadata
- Alert.tsx Alert()
- Tabs.tsx Tabs()
- Packaging & Pinout Specification
- Fault-trace.tsx Faulttrace()
- Native-select.tsx Nativeselect()
- Drone Avionics & Telemetry
- Make_film.py Probe_duration()
- Browser Builtin
- Publish_to_site.sh Script
- Build.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 343 edges
2. `react` - 55 edges
3. `rules` - 21 edges
4. `compilerOptions` - 16 edges
5. `Button()` - 15 edges
6. `plugins` - 9 edges
7. `council()` - 9 edges
8. `ignorePatterns` - 8 edges
9. `Home()` - 8 edges
10. `scripts` - 8 edges

## Surprising Connections (you probably didn't know these)
- `AlertDialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogMedia()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Drone Avionics & High-Rate ESC Telemetry** — dgrid_dshot_rx_hardware_rtl, dgrid_gcr_4b5b_erpm_telemetry, dgrid_pad_ring_bidirectional_reuse, dgrid_d100_drone_failsafe_island [EXTRACTED 0.95]
- **Dual-Domain Compute & Memory Hierarchy** — dg32_2dom_dual_domain_soc_ci2612, dg32_cdc_asynchronous_fifo_bridges, dg32_int8_attention_engine_math, dg32_18_sky130_sram_macros_86pct [EXTRACTED 0.95]
- **Edge AI Diagnostic Signal Stack** — dg32_ai_compute_envelope_scalar_50mhz, dg32_goertzel_recurrence_filter_8bin, dg32_cordic_hardware_demodulation, dg32_tree_ensembles_model_hierarchy [EXTRACTED 0.95]
- **Packaging & Physical Electrical Integrity** — dg32_qfn64_pinout_assignment_map, dg32_thermal_ground_paddle_dissipation, dg32_power_supply_sequencing_rules, dg32_pcb_high_speed_routing_guidelines [EXTRACTED 0.95]
- **Sovereignty Moat & Capital Waterfall** — deepgrid_10_sku_sovereign_portfolio, deepgrid_dap_2020_make_ii_statutory_moat, deepgrid_three_factory_sovereignty_roadmap, deepgrid_funds_10cr_capital_waterfall [EXTRACTED 0.95]

## Communities (72 total, 3 thin omitted)

### Community 0 - "Silicon Benchmarks & Scorecards"
Cohesion: 0.07
Nodes (47): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+39 more)

### Community 1 - "Sovereign Supply & Defence Moats"
Cohesion: 0.05
Nodes (46): Architecture(), blockIcons, chips, Props, Update, controlNotes, domDecisions, domFlows (+38 more)

### Community 2 - "Input.tsx Input()"
Cohesion: 0.05
Nodes (40): Input(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+32 more)

### Community 3 - "@cloudflare/vite-plugin @cloudflare/workers-types"
Cohesion: 0.04
Nodes (47): @cloudflare/vite-plugin, @cloudflare/workers-types, @openai/sites-vite-plugin, oxfmt, oxlint, oxlint-tsgolint, devDependencies, @cloudflare/vite-plugin (+39 more)

### Community 4 - "@base-ui/react Class-variance-authority"
Cohesion: 0.05
Nodes (43): @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, input-otp, lucide-react (+35 more)

### Community 5 - "Dropdown-menu.tsx Dropdownmenu()"
Cohesion: 0.09
Nodes (26): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuPortal(), DropdownMenuRadioGroup() (+18 more)

### Community 6 - "Aspect-ratio.tsx Aspectratio()"
Cohesion: 0.07
Nodes (17): AspectRatio(), Badge(), badgeVariants, Checkbox(), HoverCardContent(), InputOTP(), InputOTPGroup(), InputOTPSlot() (+9 more)

### Community 7 - "@cloudflare/workers-types Dom.iterable"
Cohesion: 0.06
Nodes (31): @cloudflare/workers-types, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, .next/types/**/*.ts, node (+23 more)

### Community 8 - "Content.ts Applications"
Cohesion: 0.10
Nodes (25): applications, Block, blocks, bootFlow, CLOCK_HZ, comparison, CYCLES_PER_INSTRUCTION, fmax (+17 more)

### Community 9 - "GraphRAG & Council Intelligence"
Cohesion: 0.11
Nodes (28): adjacency, CouncilEvent, CouncilSource, CouncilUsage, graphData, GraphifyData, GraphifyLink, GraphifyNode (+20 more)

### Community 10 - "Components.json Aliases"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "GraphRAG & Council Intelligence"
Cohesion: 0.13
Nodes (19): GroundedAnswerView(), GroundedAnswerViewProps, GraphNode, cleanExtractedText(), dotProduct(), executeGraphRAG(), ExecutiveTheme, executiveThemes (+11 more)

### Community 12 - "Command.tsx Command()"
Cohesion: 0.12
Nodes (16): Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+8 more)

### Community 13 - "Rules Import/no-anonymous-default-export"
Cohesion: 0.10
Nodes (21): rules, import/no-anonymous-default-export, no-array-constructor, no-var, prefer-const, prefer-rest-params, prefer-spread, react/display-name (+13 more)

### Community 14 - "Devices.tsx Count"
Cohesion: 0.15
Nodes (17): COUNT, DRAW, idle(), reduced(), sweep(), useCount(), useDraw(), useRail() (+9 more)

### Community 15 - "Button-group.tsx Buttongroup()"
Cohesion: 0.13
Nodes (17): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Item(), ItemActions(), ItemContent(), ItemDescription() (+9 more)

### Community 16 - "Dual-Domain & Co-Processor"
Cohesion: 0.20
Nodes (16): narration, block(), bodyH(), card2(), cardHeight(), closeFooter(), CYAN_TXT, fact() (+8 more)

### Community 17 - "Combobox.tsx Comboboxchip()"
Cohesion: 0.12
Nodes (13): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxEmpty(), ComboboxGroup(), ComboboxInput() (+5 more)

### Community 18 - "Context-menu.tsx Contextmenu()"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubTrigger() (+1 more)

### Community 19 - "Drawer.tsx Drawer()"
Cohesion: 0.14
Nodes (10): DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerSwipeHandle() (+2 more)

### Community 20 - "Silicon Benchmarks & Scorecards"
Cohesion: 0.17
Nodes (6): bodyH(), card2(), cardHeight(), narration, scale, stack()

### Community 21 - "GraphRAG & Council Intelligence"
Cohesion: 0.26
Nodes (13): buildSpecialistPrompt(), buildSynthesisPrompt(), buildTriagePrompt(), allRoutes(), corsFor(), council(), DEFAULT_MODELS, Env (+5 more)

### Community 22 - "Carousel.tsx Carousel()"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 23 - "Field.tsx Field()"
Cohesion: 0.16
Nodes (12): Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup(), FieldLabel(), FieldLegend(), FieldSeparator() (+4 more)

### Community 24 - "GraphRAG & Council Intelligence"
Cohesion: 0.26
Nodes (11): AskDeepGrid(), resolveItemDocument(), catalogToNodeMap, DocumentSource, documentSources, GraphEdge, graphEdges, graphNodes (+3 more)

### Community 25 - "Groundeddocumentshub() Library.tsx"
Cohesion: 0.19
Nodes (9): GroundedDocumentsHub(), Chapter, fmtTime(), packages, Pkg, Segment, groups, Library() (+1 more)

### Community 26 - "Alert-dialog.tsx Alertdialog()"
Cohesion: 0.15
Nodes (9): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia(), AlertDialogOverlay() (+1 more)

### Community 27 - "Button.tsx Button()"
Cohesion: 0.22
Nodes (9): Button(), buttonVariants, Calendar(), CalendarDayButton(), MessageScroller(), MessageScrollerButton(), MessageScrollerContent(), MessageScrollerItem() (+1 more)

### Community 28 - "Chart.tsx Chartconfig"
Cohesion: 0.21
Nodes (11): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+3 more)

### Community 29 - "Toast.tsx Toast"
Cohesion: 0.15
Nodes (7): toast, ToastAction(), ToastClose(), ToastContent(), ToastDescription(), ToastTitle(), ToastViewport()

### Community 30 - "Silicon Benchmarks & Scorecards"
Cohesion: 0.17
Nodes (11): Callout(), Explained, DataTable(), Diagram(), ExplainedGrid(), Eyebrow(), Flows(), Sec() (+3 more)

### Community 31 - "Attachment.tsx Attachment()"
Cohesion: 0.20
Nodes (11): Attachment(), AttachmentAction(), AttachmentActions(), AttachmentContent(), AttachmentDescription(), AttachmentGroup(), AttachmentMedia(), attachmentMediaVariants (+3 more)

### Community 32 - "Silicon Benchmarks & Scorecards"
Cohesion: 0.23
Nodes (7): chain(), footer(), header(), headerDark(), PX(), rail(), T

### Community 33 - "Input-group.tsx Inputgroup()"
Cohesion: 0.24
Nodes (9): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+1 more)

### Community 34 - ".oxfmtrc.json Ignorepatterns"
Cohesion: 0.18
Nodes (10): ignorePatterns, printWidth, $schema, singleQuote, sortPackageJson, bun.lock, bun.lockb, package-lock.json (+2 more)

### Community 35 - "Package-pages.mjs Appsource"
Cohesion: 0.18
Nodes (10): appSource, base, domain, html, images, output, pkgSource, root (+2 more)

### Community 36 - "Dual-Domain & Co-Processor"
Cohesion: 0.53
Nodes (7): band(), cardGrid(), closeSlide(), coverSlide(), kpiRow(), loadNotes(), packageMotif()

### Community 37 - "Deepgridcatalog Deepgriditem"
Cohesion: 0.33
Nodes (6): deepGridCatalog, DeepGridItem, GroundedAnswer, ReferenceLink, GroundedDoc, groundedDocuments

### Community 38 - "Navigation-menu.tsx Navigationmenu()"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuPositioner(), NavigationMenuTrigger() (+1 more)

### Community 39 - "Edge AI & Diagnostics"
Cohesion: 0.20
Nodes (10): Thirty Industrial Diagnostics & Observers Suite, AFE Sensing Constraints & ISO 13373-2 Dynamic Range, DG32-LITE AI Compute Envelope (50 MHz RV32IM), ASIL-D Advisory Decoupling for Machine Learning, Broken Rotor Bar Detection (MCSA), Hardware CORDIC Envelope Demodulation, CWRU Bearing Dataset Leakage Audit, 8-Bin Goertzel Recurrence Filter (+2 more)

### Community 40 - "Verify-site.mjs Errors"
Cohesion: 0.20
Nodes (4): errors, failed, fails, routes

### Community 41 - "Pagination.tsx Pagination()"
Cohesion: 0.22
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 42 - "Sovereign Supply & Defence Moats"
Cohesion: 0.22
Nodes (9): DeepGrid 10-SKU Sovereign Silicon Portfolio, Chinese Price Crash Stress Test & Stop Rules S1–S4, DAP-2020 Buy (Indian-IDDM) & Make-II Statutory Moat, ₹10 Cr Capital Waterfall & 24-Month Seed Runway, Organic Substrate Multi-Die SiP vs Silicon Interposer, PIL-5 Positive Indigenisation Lists (346 Items), Software-Defined Vehicle (SDV) Reference Zonal Platform, SKU-7 77 GHz 4D MIMO Radar in IHP 130 nm SiGe BiCMOS (+1 more)

### Community 43 - "Empty.tsx Empty()"
Cohesion: 0.29
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 44 - "Dual-Domain & Co-Processor"
Cohesion: 0.25
Nodes (8): 18 On-Die SkyWater SRAM Macros (86% Die Area), DG32-2DOM Dual-Domain SoC (chipIgnite CI2612), 39-Cycle Hardware Lockstep Safe-State Latch, AVIP Stator Current Bearing Diagnostics, Clock Domain Crossing (CDC) Asynchronous FIFO, FOC Control Loop Cycle Budget & 82% Headroom, INT8 Attention Engine Math (40-bit Accumulator), 28 KB vs 32 KB SRAM Floorplan Lever

### Community 45 - "Ignorepatterns Next-env.d.ts"
Cohesion: 0.25
Nodes (7): ignorePatterns, next-env.d.ts, build/**, coverage/**, dist/**, out/**, .vinext/**

### Community 46 - "Plugins Eslint"
Cohesion: 0.25
Nodes (8): plugins, eslint, import, jsx-a11y, nextjs, oxc, typescript, unicorn

### Community 47 - "Narrate_kokoro.py Main()"
Cohesion: 0.46
Nodes (7): main(), median_f0(), Autocorrelation pitch over voiced 40 ms frames, 70-300 Hz search., spoken(), spoken_words(), synth(), trim()

### Community 48 - "App-card.tsx Appcard()"
Cohesion: 0.43
Nodes (5): AppCard(), AppCardData, App3DType, AppModel3D(), react

### Community 49 - "Dual-Domain & Co-Processor"
Cohesion: 0.38
Nodes (6): createBlockLabelTexture(), createLaserMarkTextures(), Region, REGIONS_2DOM_EXTRA, REGIONS_LITE, Silicon()

### Community 50 - "Avatar.tsx Avatar()"
Cohesion: 0.29
Nodes (6): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

### Community 51 - "Bubble.tsx Bubble()"
Cohesion: 0.38
Nodes (6): Bubble(), BubbleContent(), BubbleGroup(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants

### Community 52 - "Message.tsx Message()"
Cohesion: 0.29
Nodes (6): Message(), MessageAvatar(), MessageContent(), MessageFooter(), MessageGroup(), MessageHeader()

### Community 53 - "Popover.tsx Popover()"
Cohesion: 0.29
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 54 - "Toggle.tsx Toggle-group.tsx"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 55 - ".oxlintrc.json Categories"
Cohesion: 0.29
Nodes (6): categories, correctness, options, typeAware, typeCheck, $schema

### Community 56 - "Main() Check_narration.py"
Cohesion: 0.57
Nodes (5): deck_text(), main(), Per-slide text from a .pptx, or from a '### idNNN' blocked text file., trigrams(), main()

### Community 57 - "Layout.tsx Metadata"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, .next/**

### Community 58 - "Alert.tsx Alert()"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 59 - "Tabs.tsx Tabs()"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 60 - "Packaging & Pinout Specification"
Cohesion: 0.33
Nodes (6): 64 KB Standalone Boot ROM & QSPI Fast Read, ESD Diode Biasing on Unused Power Rails, PCB Layout Rules for High-Speed Differential Pairs, Power Supply Sequencing Rules (1.8V Core / 3.3V I/O), 64-Pin QFN Physical Pin Map (9x9 mm), Thermal Ground Paddle & Heat Dissipation (<0.43W)

### Community 62 - "Native-select.tsx Nativeselect()"
Cohesion: 0.40
Nodes (4): NativeSelect(), NativeSelectOptGroup(), NativeSelectOption(), NativeSelectProps

### Community 63 - "Drone Avionics & Telemetry"
Cohesion: 0.40
Nodes (5): D100 Tactical Drone Failsafe Island, Hardware DShot RX RTL Block (dgrid_dshot_rx), Slot 0xC RTL Bus Extensions for Motor Telemetry, GCR 4b/5b Bidirectional eRPM Telemetry Reply Engine, Pad-Ring Bidirectional Pin Reuse (No Analog Switch)

### Community 64 - "Make_film.py Probe_duration()"
Cohesion: 0.50
Nodes (3): probe_duration(), Assemble a narrated film from deck frames + Holt-profile narration clips.…, run()

### Community 66 - "Browser Builtin"
Cohesion: 0.50
Nodes (4): env, browser, builtin, node

## Knowledge Gaps
- **263 isolated node(s):** `$schema`, `singleQuote`, `printWidth`, `sortPackageJson`, `package-lock.json` (+258 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 350 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App-card.tsx Appcard()` to `Silicon Benchmarks & Scorecards`, `Sovereign Supply & Defence Moats`, `Input.tsx Input()`, `Dropdown-menu.tsx Dropdownmenu()`, `Aspect-ratio.tsx Aspectratio()`, `Content.ts Applications`, `GraphRAG & Council Intelligence`, `GraphRAG & Council Intelligence`, `Command.tsx Command()`, `Devices.tsx Count`, `Button-group.tsx Buttongroup()`, `Combobox.tsx Comboboxchip()`, `Context-menu.tsx Contextmenu()`, `Drawer.tsx Drawer()`, `Carousel.tsx Carousel()`, `Field.tsx Field()`, `GraphRAG & Council Intelligence`, `Groundeddocumentshub() Library.tsx`, `Alert-dialog.tsx Alertdialog()`, `Button.tsx Button()`, `Chart.tsx Chartconfig`, `Toast.tsx Toast`, `Silicon Benchmarks & Scorecards`, `Attachment.tsx Attachment()`, `Input-group.tsx Inputgroup()`, `Deepgridcatalog Deepgriditem`, `Pagination.tsx Pagination()`, `Plugins Eslint`, `Dual-Domain & Co-Processor`, `Avatar.tsx Avatar()`, `Bubble.tsx Bubble()`, `Message.tsx Message()`, `Popover.tsx Popover()`, `Toggle.tsx Toggle-group.tsx`, `Alert.tsx Alert()`, `Fault-trace.tsx Faulttrace()`, `Native-select.tsx Nativeselect()`?**
  _High betweenness centrality (0.246) - this node is a cross-community bridge._
- **Why does `cn()` connect `Silicon Benchmarks & Scorecards` to `Input.tsx Input()`, `Dropdown-menu.tsx Dropdownmenu()`, `Aspect-ratio.tsx Aspectratio()`, `Command.tsx Command()`, `Button-group.tsx Buttongroup()`, `Combobox.tsx Comboboxchip()`, `Context-menu.tsx Contextmenu()`, `Drawer.tsx Drawer()`, `Carousel.tsx Carousel()`, `Field.tsx Field()`, `Alert-dialog.tsx Alertdialog()`, `Button.tsx Button()`, `Chart.tsx Chartconfig`, `Toast.tsx Toast`, `Attachment.tsx Attachment()`, `Input-group.tsx Inputgroup()`, `Navigation-menu.tsx Navigationmenu()`, `Pagination.tsx Pagination()`, `Empty.tsx Empty()`, `Avatar.tsx Avatar()`, `Bubble.tsx Bubble()`, `Message.tsx Message()`, `Popover.tsx Popover()`, `Toggle.tsx Toggle-group.tsx`, `Alert.tsx Alert()`, `Tabs.tsx Tabs()`, `Native-select.tsx Nativeselect()`?**
  _High betweenness centrality (0.231) - this node is a cross-community bridge._
- **Why does `plugins` connect `Plugins Eslint` to `App-card.tsx Appcard()`, `.oxlintrc.json Categories`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **What connects `$schema`, `singleQuote`, `printWidth` to the rest of the system?**
  _263 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Silicon Benchmarks & Scorecards` be split into smaller, more focused modules?**
  _Cohesion score 0.06558441558441558 - nodes in this community are weakly interconnected._
- **Should `Sovereign Supply & Defence Moats` be split into smaller, more focused modules?**
  _Cohesion score 0.05279034690799397 - nodes in this community are weakly interconnected._
- **Should `Input.tsx Input()` be split into smaller, more focused modules?**
  _Cohesion score 0.053877551020408164 - nodes in this community are weakly interconnected._