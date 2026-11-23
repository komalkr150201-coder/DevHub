import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../state/auth_state.dart';
import '../../core/app_theme.dart';
import '../../widgets/devhub_widgets.dart';

class SkillsScreen extends StatefulWidget {
  const SkillsScreen({super.key});

  @override
  State<SkillsScreen> createState() => _SkillsScreenState();
}

class _SkillsScreenState extends State<SkillsScreen> {
  final categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Other'];

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.violet,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Skill', style: TextStyle(color: Colors.white)),
        onPressed: () => _showAddSkillDialog(context, auth),
      ),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          SectionTitle(
            'My Skills & Competencies',
            subtitle:
                'Extracted automatically from GitHub repositories and manually maintained.',
          ),
          const SizedBox(height: 20),
          ...categories.map((cat) {
            final list = auth.skills
                .where((s) =>
                    (s['category'] ?? 'Other')
                        .toString()
                        .toLowerCase() ==
                    cat.toLowerCase())
                .toList();

            if (list.isEmpty) return const SizedBox.shrink();

            return Padding(
              padding: const EdgeInsets.only(bottom: 18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SectionTitle(cat, subtitle: '${list.length} skills'),
                  const SizedBox(height: 10),
                  Panel(
                    child: Column(
                      children: list.map((s) {
                        final skillName = '${s['name'] ?? 'Skill'}';
                        final weight =
                            (s['weight'] ?? s['normalizedScore'] ?? s['score'] ?? .5);
                        final n = weight is num
                            ? weight.toDouble()
                            : double.tryParse('$weight') ?? .5;
                        final pct = n > 1 ? n / 100 : n;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 13),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      skillName,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '${(pct * 100).round()}%',
                                    style: const TextStyle(
                                      color: AppColors.muted,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(
                                      Icons.delete_outline,
                                      size: 18,
                                      color: AppColors.red,
                                    ),
                                    onPressed: () =>
                                        _deleteSkill(context, auth, skillName),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: LinearProgressIndicator(
                                  value: pct.clamp(0.0, 1.0),
                                  minHeight: 7,
                                  backgroundColor: AppColors.line,
                                  color: AppColors.violet,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            );
          }),
          if (auth.skills.isEmpty)
            const Panel(
              child: Text(
                'No skills found. Sync GitHub data or add custom skills manually.',
                style: TextStyle(color: AppColors.muted),
              ),
            ),
          const SizedBox(height: 70), // Bottom padding for FAB
        ],
      ),
    );
  }

  Future<void> _showAddSkillDialog(BuildContext context, AuthState auth) async {
    final nameController = TextEditingController();
    String selectedCategory = 'Frontend';
    double level = 80;

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDlgState) => AlertDialog(
          backgroundColor: AppColors.card,
          title: const Text('Add Skill'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Skill Name',
                  hintText: 'e.g. Kotlin, Docker, GraphQL',
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: selectedCategory,
                decoration: const InputDecoration(labelText: 'Category'),
                dropdownColor: AppColors.card,
                items: categories
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setDlgState(() => selectedCategory = val);
                },
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Proficiency Level:'),
                  Text(
                    '${level.round()}%',
                    style: const TextStyle(
                      color: AppColors.violet,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Slider(
                value: level,
                min: 10,
                max: 100,
                activeColor: AppColors.violet,
                onChanged: (val) => setDlgState(() => level = val),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );

    if (ok != true || nameController.text.trim().isEmpty) return;

    try {
      final updated = List<Map<String, dynamic>>.from(auth.skills);
      updated.add({
        'name': nameController.text.trim(),
        'category': selectedCategory,
        'weight': level / 100,
      });
      await auth.saveSkills(updated);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Added skill "${nameController.text.trim()}"'),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }

  Future<void> _deleteSkill(
    BuildContext context,
    AuthState auth,
    String skillName,
  ) async {
    try {
      final updated = auth.skills
          .where((s) => s['name']?.toString().toLowerCase() != skillName.toLowerCase())
          .map((s) => Map<String, dynamic>.from(s))
          .toList();
      await auth.saveSkills(updated);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Removed skill "$skillName"')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }
}
