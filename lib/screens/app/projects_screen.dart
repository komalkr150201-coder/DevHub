import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/devhub_api.dart';
import '../../core/app_theme.dart';
import '../../widgets/devhub_widgets.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({super.key});

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  late Future<Map<String, dynamic>> future;

  @override
  void initState() {
    super.initState();
    future = context.read<DevHubApi>().projects();
  }

  void reload() => setState(() => future = context.read<DevHubApi>().projects());

  @override
  Widget build(BuildContext context) => FutureBuilder<Map<String, dynamic>>(
        future: future,
        builder: (context, s) {
          if (s.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (s.hasError) {
            return ErrorView(message: '${s.error}', retry: reload);
          }
          final projects = List<dynamic>.from(s.data?['projects'] ?? []);
          return ListView(
            padding: const EdgeInsets.all(18),
            children: [
              SectionTitle(
                'Project boards',
                subtitle: 'Find projects looking for teammates',
                trailing: IconButton(
                  onPressed: reload,
                  icon: const Icon(Icons.refresh),
                ),
              ),
              const SizedBox(height: 14),
              ...projects.map((e) {
                final p = Map<String, dynamic>.from(e);
                final owner = Map<String, dynamic>.from(p['ownerId'] ?? {});
                final req = List<dynamic>.from(p['requiredSkills'] ?? []);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Panel(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${p['title'] ?? 'Untitled project'}',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${p['description'] ?? ''}',
                          maxLines: 4,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: AppColors.muted),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: req
                              .map((r) => SkillPill('${r['name'] ?? r}'))
                              .toList(),
                        ),
                        const Divider(height: 22),
                        Row(
                          children: [
                            InitialAvatar(
                              name:
                                  '${owner['name'] ?? owner['username'] ?? 'D'}',
                              url: '${owner['avatarUrl'] ?? ''}',
                              size: 30,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                '@${owner['username'] ?? 'developer'}',
                                style: const TextStyle(
                                  color: AppColors.muted,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            SkillPill('${p['status'] ?? 'open'}'),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),
              if (projects.isEmpty)
                const Panel(
                  child: Text(
                    'No open project posts yet.',
                    style: TextStyle(color: AppColors.muted),
                  ),
                ),
              const SizedBox(height: 12),
              GradientButton(
                label: 'Post a project',
                icon: Icons.add,
                onPressed: () => _create(context),
              ),
            ],
          );
        },
      );

  Future<void> _create(BuildContext context) async {
    final api = context.read<DevHubApi>();
    final title = TextEditingController(),
        desc = TextEditingController(),
        skills = TextEditingController();
    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          20,
          20,
          MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Create project', style: Theme.of(ctx).textTheme.titleLarge),
            const SizedBox(height: 14),
            TextField(
              controller: title,
              decoration: const InputDecoration(labelText: 'Project title'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: desc,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Description'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: skills,
              decoration: const InputDecoration(
                labelText: 'Required skills (comma separated)',
              ),
            ),
            const SizedBox(height: 16),
            GradientButton(
              label: 'Publish project',
              onPressed: () => Navigator.pop(ctx, true),
            ),
          ],
        ),
      ),
    );
    if (ok != true) return;
    try {
      final reqSkills = skills.text
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .map((s) => {'name': s, 'importance': 3})
          .toList();

      await api.createProject({
        'title': title.text,
        'description': desc.text,
        'requiredSkills': reqSkills,
      });
      reload();
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }
}
