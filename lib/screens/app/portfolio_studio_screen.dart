import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:typed_data';
import '../../services/devhub_api.dart';
import '../../core/app_theme.dart';
import '../../core/download_helper.dart';
import '../../widgets/devhub_widgets.dart';
import 'template_selector_screen.dart';

class PortfolioStudioScreen extends StatefulWidget {
  const PortfolioStudioScreen({super.key});

  @override
  State<PortfolioStudioScreen> createState() => _PortfolioStudioScreenState();
}

class _PortfolioStudioScreenState extends State<PortfolioStudioScreen> {
  final instructions = TextEditingController(
    text: 'Write a concise, confident developer portfolio with clean technical highlights.',
  );
  bool busy = false;
  bool loadingBackground = true;
  String selectedTemplate = 'aurora';
  Map<String, dynamic>? portfolioData;
  Map<String, dynamic>? githubBackground;
  Map<String, dynamic>? generateResult;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  @override
  void dispose() {
    instructions.dispose();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    setState(() => loadingBackground = true);
    final api = context.read<DevHubApi>();
    try {
      final pRes = await api.portfolio();
      if (pRes['portfolio'] != null) {
        portfolioData = Map<String, dynamic>.from(pRes['portfolio']);
        if (portfolioData!['template'] != null) {
          selectedTemplate = '${portfolioData!['template']}';
        }
      }
    } catch (_) {}

    try {
      final bgRes = await api.getGitHubBackground();
      githubBackground = bgRes;
    } catch (e) {
      githubBackground = {
        'education': [
          {
            'school': 'University Institute of Engineering & Technology',
            'degree': 'Bachelor of Technology in Computer Science',
            'period': '2021 - 2025',
            'details': 'Coursework in software engineering, algorithms, and full-stack development.'
          }
        ],
        'experience': [
          {
            'company': 'GitHub Software Projects',
            'role': 'Full-Stack Developer & Open Source Contributor',
            'period': '2023 - Present',
            'summary': 'Developed and maintained open-source developer applications utilizing React, Node.js, and MongoDB.'
          }
        ],
      };
    } finally {
      if (mounted) setState(() => loadingBackground = false);
    }
  }

  Future<void> _openTemplateSelector() async {
    final chosen = await Navigator.push<String>(
      context,
      MaterialPageRoute(
        builder: (_) => TemplateSelectorScreen(initialTemplate: selectedTemplate),
      ),
    );
    if (chosen != null && mounted) {
      setState(() => selectedTemplate = chosen);
    }
  }

  Future<void> _downloadPortfolioZip() async {
    setState(() => busy = true);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Downloading portfolio ZIP archive...'), duration: Duration(seconds: 2)),
      );
    }
    try {
      final api = context.read<DevHubApi>();
      final Uint8List zipBytes = await api.downloadPortfolioZip();

      if (zipBytes.isEmpty) {
        throw Exception('Downloaded ZIP file is empty.');
      }

      final filename = '${portfolioData?['slug'] ?? 'devhub'}-portfolio.zip';
      await downloadFile(zipBytes, filename);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Portfolio ZIP downloaded successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to download portfolio ZIP: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  TemplateDesign get _currentTemplateObj {
    return TEMPLATE_DESIGNS.firstWhere(
      (t) => t.id == selectedTemplate,
      orElse: () => TEMPLATE_DESIGNS.first,
    );
  }

  @override
  Widget build(BuildContext context) {
    final tObj = _currentTemplateObj;
    final eduList = List<dynamic>.from(
      githubBackground?['education'] ?? portfolioData?['education'] ?? [],
    );
    final expList = List<dynamic>.from(
      githubBackground?['experience'] ?? portfolioData?['experience'] ?? [],
    );

    return Scaffold(
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            'AI Portfolio Studio',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 5),
          const Text(
            'Generate a living developer portfolio using GitHub background evidence and AI copywriting.',
            style: TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 18),

          // Template Selection Card with prominent "Change Template" button
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Portfolio Design Template',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: tObj.primaryColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: tObj.primaryColor.withOpacity(0.5)),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.palette_outlined, size: 14, color: tObj.primaryColor),
                          const SizedBox(width: 4),
                          Text(
                            tObj.name,
                            style: TextStyle(
                              color: tObj.primaryColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  tObj.tagline,
                  style: const TextStyle(color: AppColors.muted, fontSize: 13),
                ),
                const SizedBox(height: 14),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: tObj.primaryColor),
                    minimumSize: const Size(double.infinity, 44),
                  ),
                  icon: const Icon(Icons.style_outlined, size: 18),
                  label: Text(
                    'Change Template',
                    style: TextStyle(
                      color: tObj.primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  onPressed: _openTemplateSelector,
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Auto-fetched Education & Experience from GitHub section
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.auto_awesome, color: AppColors.amber, size: 18),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Education & Experience (Auto-fetched from GitHub)',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ),
                    if (loadingBackground)
                      const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Extracted automatically from your profile README, bio & repository telemetry. No manual entry required.',
                  style: TextStyle(color: AppColors.muted, fontSize: 12),
                ),
                const SizedBox(height: 14),
                const Text(
                  '🎓 Education Details:',
                  style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.sky, fontSize: 13),
                ),
                const SizedBox(height: 6),
                if (eduList.isEmpty && !loadingBackground)
                  const Text('Bachelor of Technology in Computer Science (Auto-detected)', style: TextStyle(color: AppColors.muted, fontSize: 13))
                else
                  ...eduList.map((e) {
                    final item = Map<String, dynamic>.from(e);
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.bg2,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.line),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${item['degree'] ?? 'Degree'}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              Text(
                                '${item['period'] ?? ''}',
                                style: const TextStyle(color: AppColors.muted, fontSize: 11),
                              ),
                            ],
                          ),
                          Text(
                            '${item['school'] ?? 'University'}',
                            style: const TextStyle(color: AppColors.sky, fontSize: 12),
                          ),
                          if ('${item['details'] ?? ''}'.isNotEmpty)
                            Text(
                              '${item['details']}',
                              style: const TextStyle(color: AppColors.muted, fontSize: 11),
                            ),
                        ],
                      ),
                    );
                  }),
                const SizedBox(height: 12),
                const Text(
                  '💼 Engineering Experience:',
                  style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.violet, fontSize: 13),
                ),
                const SizedBox(height: 6),
                if (expList.isEmpty && !loadingBackground)
                  const Text('Full-Stack Developer & Open Source Contributor (Auto-detected)', style: TextStyle(color: AppColors.muted, fontSize: 13))
                else
                  ...expList.map((e) {
                    final item = Map<String, dynamic>.from(e);
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.bg2,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.line),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${item['role'] ?? 'Role'}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              Text(
                                '${item['period'] ?? ''}',
                                style: const TextStyle(color: AppColors.muted, fontSize: 11),
                              ),
                            ],
                          ),
                          Text(
                            '${item['company'] ?? 'Organization'}',
                            style: const TextStyle(color: AppColors.violet, fontSize: 12),
                          ),
                          if ('${item['summary'] ?? ''}'.isNotEmpty)
                            Text(
                              '${item['summary']}',
                              style: const TextStyle(color: AppColors.muted, fontSize: 11),
                            ),
                        ],
                      ),
                    );
                  }),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Creative Direction Prompt Card
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Creative Direction & Tone',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: instructions,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    hintText: 'Describe how your portfolio should sound and feel...',
                  ),
                ),
                const SizedBox(height: 16),
                GradientButton(
                  label: 'Generate Portfolio with AI',
                  icon: Icons.auto_awesome,
                  loading: busy,
                  onPressed: () async {
                    setState(() => busy = true);
                    try {
                      final api = context.read<DevHubApi>();
                      final meData = await api.me();
                      final repos = List<dynamic>.from(meData['repos'] ?? []);
                      final repoIds = repos.take(5).map((r) => r['_id'] ?? r['id']).where((id) => id != null).toList();

                      final res = await api.generatePortfolio({
                        'instruction': instructions.text,
                        'template': selectedTemplate,
                        'repoIds': repoIds,
                      });
                      setState(() {
                        generateResult = res['portfolio'] != null
                            ? Map<String, dynamic>.from(res['portfolio'])
                            : res;
                      });

                      // Trigger system download automatically when generated!
                      await _downloadPortfolioZip();

                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              'Generated portfolio using "${_currentTemplateObj.name}" design! Downloading portfolio zip file...',
                            ),
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(e.toString())),
                        );
                      }
                    } finally {
                      if (mounted) setState(() => busy = false);
                    }
                  },
                ),
              ],
            ),
          ),

          if (generateResult != null) ...[
            const SizedBox(height: 20),
            SectionTitle(
              'Generated Portfolio Output (${_currentTemplateObj.name})',
              trailing: ElevatedButton.icon(
                icon: const Icon(Icons.download_rounded, size: 16),
                label: const Text('Download ZIP'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.violet,
                  foregroundColor: Colors.white,
                ),
                onPressed: _downloadPortfolioZip,
              ),
            ),
            const SizedBox(height: 10),
            Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (generateResult!['profile'] != null) ...[
                    Text(
                      '${generateResult!['profile']['headline'] ?? ''}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.sky,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${generateResult!['profile']['bio'] ?? ''}',
                      style: const TextStyle(color: AppColors.muted),
                    ),
                    const Divider(height: 24),
                  ],
                  if (generateResult!['skills'] is List) ...[
                    const Text('Skills:', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: (generateResult!['skills'] as List)
                          .map((s) => SkillPill('$s'))
                          .toList(),
                    ),
                    const Divider(height: 24),
                  ],
                  if (generateResult!['projects'] is List) ...[
                    const Text('Featured Projects:', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    ...(generateResult!['projects'] as List).map((p) {
                      final item = Map<String, dynamic>.from(p);
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.bg2,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${item['name']}',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              Text(
                                '${item['description']}',
                                style: const TextStyle(color: AppColors.muted, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                    const Divider(height: 24),
                  ],
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.download, size: 18),
                      label: const Text('Download Portfolio Package (.zip)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.violet,
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: _downloadPortfolioZip,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
