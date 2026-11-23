import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/devhub_api.dart';
import '../../core/app_theme.dart';
import '../../widgets/devhub_widgets.dart';

class TemplateDesign {
  final String id;
  final String name;
  final String tagline;
  final String tone;
  final List<String> features;
  final Color primaryColor;
  final Color secondaryColor;
  final Color cardBg;
  final Color textColor;

  const TemplateDesign({
    required this.id,
    required this.name,
    required this.tagline,
    required this.tone,
    required this.features,
    required this.primaryColor,
    required this.secondaryColor,
    required this.cardBg,
    required this.textColor,
  });
}

const List<TemplateDesign> TEMPLATE_DESIGNS = [
  TemplateDesign(
    id: 'aurora',
    name: 'Aurora Dark',
    tagline: 'Futuristic dark mode with glowing indigo/violet gradients & glassmorphism.',
    tone: 'Popular',
    features: ['Indigo & Cyan Gradients', 'Glassmorphism Cards', 'Modern Software Focus'],
    primaryColor: AppColors.violet,
    secondaryColor: AppColors.sky,
    cardBg: Color(0xFF111737),
    textColor: Colors.white,
  ),
  TemplateDesign(
    id: 'minimal',
    name: 'Minimalist Clean',
    tagline: 'High-contrast monochrome design focused on crisp typography & white space.',
    tone: 'Clean',
    features: ['High Contrast Monochrome', 'Crisp Typography', 'Executive Summary Style'],
    primaryColor: Color(0xFF0F172A),
    secondaryColor: Color(0xFF475569),
    cardBg: Color(0xFF1E293B),
    textColor: Colors.white,
  ),
  TemplateDesign(
    id: 'terminal',
    name: 'Terminal Hacker',
    tagline: 'Hacker-style matrix black & emerald green terminal prompt aesthetic.',
    tone: 'Hacker',
    features: ['Command-line Monospace font', 'Emerald Green Prompts', 'CLI Output Blocks'],
    primaryColor: Color(0xFF10B981),
    secondaryColor: Color(0xFF059669),
    cardBg: Color(0xFF050B14),
    textColor: Color(0xFF34D399),
  ),
  TemplateDesign(
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    tagline: 'High-voltage neon pink, cyan & gold cyber grid aesthetic for game & Web3 devs.',
    tone: 'Vibrant',
    features: ['Neon Cyan & Magenta Glow', 'Cyber Grid Cards', 'High-Impact Badges'],
    primaryColor: Color(0xFFEC4899),
    secondaryColor: Color(0xFF06B6D4),
    cardBg: Color(0xFF180B28),
    textColor: Color(0xFFF472B6),
  ),
];

class TemplateSelectorScreen extends StatefulWidget {
  final String? initialTemplate;
  const TemplateSelectorScreen({super.key, this.initialTemplate});

  @override
  State<TemplateSelectorScreen> createState() => _TemplateSelectorScreenState();
}

class _TemplateSelectorScreenState extends State<TemplateSelectorScreen> {
  late String selectedId;
  bool busy = false;

  @override
  void initState() {
    super.initState();
    selectedId = widget.initialTemplate ?? 'aurora';
    _loadCurrentTemplate();
  }

  Future<void> _loadCurrentTemplate() async {
    try {
      final res = await context.read<DevHubApi>().portfolio();
      if (res['portfolio'] != null && res['portfolio']['template'] != null) {
        final t = '${res['portfolio']['template']}';
        if (mounted && TEMPLATE_DESIGNS.any((d) => d.id == t)) {
          setState(() => selectedId = t);
        }
      }
    } catch (_) {}
  }

  Future<void> _selectTemplate(String id) async {
    setState(() {
      selectedId = id;
      busy = true;
    });
    try {
      await context.read<DevHubApi>().savePortfolio({'template': id});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Selected "${TEMPLATE_DESIGNS.firstWhere((d) => d.id == id).name}" template!'),
          ),
        );
        Navigator.pop(context, id);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update template: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Choose Portfolio Template'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            'Portfolio Design Gallery',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 6),
          const Text(
            'Choose how the AI should generate and render your developer portfolio.',
            style: TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 20),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: MediaQuery.of(context).size.width > 600 ? 2 : 1,
              mainAxisExtent: 380,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: TEMPLATE_DESIGNS.length,
            itemBuilder: (context, idx) {
              final t = TEMPLATE_DESIGNS[idx];
              final isSelected = selectedId == t.id;
              return _buildTemplateCard(t, isSelected);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTemplateCard(TemplateDesign t, bool isSelected) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isSelected ? t.primaryColor : AppColors.line,
          width: isSelected ? 2.5 : 1.0,
        ),
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: t.primaryColor.withOpacity(0.25),
                  blurRadius: 16,
                  spreadRadius: 2,
                ),
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Visual Mock Preview Header
          Container(
            height: 140,
            width: double.infinity,
            decoration: BoxDecoration(
              color: t.cardBg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
              border: Border(bottom: BorderSide(color: t.primaryColor.withOpacity(0.3))),
            ),
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 14,
                          backgroundColor: t.primaryColor,
                          child: Icon(
                            t.id == 'terminal' ? Icons.terminal : Icons.person,
                            size: 14,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          t.id == 'terminal' ? '> devhub_init' : 'Developer Portfolio',
                          style: TextStyle(
                            color: t.textColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            fontFamily: t.id == 'terminal' ? 'monospace' : null,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: t.primaryColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: t.primaryColor.withOpacity(0.4)),
                      ),
                      child: Text(
                        t.tone,
                        style: TextStyle(
                          color: t.primaryColor,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                Text(
                  t.id == 'terminal'
                      ? 'System.out.println("Software Architect & Open Source Developer")'
                      : 'Full-Stack Software Engineer',
                  style: TextStyle(
                    color: t.primaryColor,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    fontFamily: t.id == 'terminal' ? 'monospace' : null,
                  ),
                ),
                Row(
                  children: [
                    _miniChip('React', t),
                    const SizedBox(width: 5),
                    _miniChip('Node.js', t),
                    const SizedBox(width: 5),
                    _miniChip('MongoDB', t),
                  ],
                ),
              ],
            ),
          ),

          // Details Body
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        t.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (isSelected) ...[
                        const SizedBox(width: 8),
                        const Icon(Icons.check_circle, color: AppColors.green, size: 18),
                      ],
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    t.tagline,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                    ),
                  ),
                  const Spacer(),
                  Wrap(
                    spacing: 4,
                    runSpacing: 4,
                    children: t.features
                        .map(
                          (f) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.bg2,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '• $f',
                              style: const TextStyle(color: AppColors.muted, fontSize: 10),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: isSelected
                        ? ElevatedButton.icon(
                            onPressed: null,
                            icon: const Icon(Icons.check, size: 16),
                            label: const Text('Currently Selected'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.violet.withOpacity(0.3),
                              disabledForegroundColor: AppColors.violet,
                            ),
                          )
                        : OutlinedButton(
                            onPressed: busy ? null : () => _selectTemplate(t.id),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: t.primaryColor),
                            ),
                            child: Text(
                              'Use ${t.name}',
                              style: TextStyle(color: t.primaryColor, fontWeight: FontWeight.bold),
                            ),
                          ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _miniChip(String text, TemplateDesign t) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: t.secondaryColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: t.secondaryColor.withOpacity(0.4), width: 0.5),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: t.textColor.withOpacity(0.9),
          fontSize: 9,
          fontFamily: t.id == 'terminal' ? 'monospace' : null,
        ),
      ),
    );
  }
}
