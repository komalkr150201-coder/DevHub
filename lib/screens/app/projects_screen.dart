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

  void reload() =>
      setState(() => future = context.read<DevHubApi>().projects());

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
                'Project Boards',
                subtitle: 'Find projects looking for teammates',
                trailing: IconButton(
                  onPressed: reload,
                  icon: const Icon(Icons.refresh),
                ),
              ),
              const SizedBox(height: 14),
              ...projects.map((e) {
                final p = Map<String, dynamic>.from(e);
                final projectId = '${p['_id'] ?? p['id'] ?? ''}';
                final owner = Map<String, dynamic>.from(p['ownerId'] ?? {});
                final req = List<dynamic>.from(p['requiredSkills'] ?? []);

                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Panel(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                '${p['title'] ?? 'Untitled Project'}',
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                            ),
                            SkillPill('${p['status'] ?? 'open'}'),
                          ],
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
                            OutlinedButton.icon(
                              icon: const Icon(Icons.auto_awesome, size: 16),
                              label: const Text('Find Matches'),
                              onPressed: () => _showProjectMatches(
                                context,
                                projectId,
                                '${p['title'] ?? 'Project'}',
                              ),
                            ),
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
                    'No open project posts yet. Be the first to create one!',
                    style: TextStyle(color: AppColors.muted),
                  ),
                ),
              const SizedBox(height: 14),
              GradientButton(
                label: 'Post a Project Requirement',
                icon: Icons.add,
                onPressed: () => _create(context),
              ),
            ],
          );
        },
      );

  Future<void> _showProjectMatches(
    BuildContext context,
    String projectId,
    String projectTitle,
  ) async {
    final api = context.read<DevHubApi>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.75,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Matches for $projectTitle',
                        style: Theme.of(ctx).textTheme.titleLarge,
                      ),
                      const Text(
                        'AI-ranked candidate developers suited for this project',
                        style: TextStyle(color: AppColors.muted, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Expanded(
              child: FutureBuilder<Map<String, dynamic>>(
                future: api.projectMatches(projectId),
                builder: (context, snap) {
                  if (snap.connectionState == ConnectionState.waiting) {
                    return const LoadingView();
                  }
                  if (snap.hasError) {
                    return ErrorView(
                      message: '${snap.error}',
                      retry: () => setState(() {}),
                    );
                  }
                  final matches = List<dynamic>.from(
                    snap.data?['matches'] ?? snap.data?['results'] ?? [],
                  );
                  if (matches.isEmpty) {
                    return const Center(
                      child: Text(
                        'No candidate matches found for this project requirements yet.',
                        style: TextStyle(color: AppColors.muted),
                      ),
                    );
                  }
                  return ListView.builder(
                    itemCount: matches.length,
                    itemBuilder: (context, i) {
                      final m = Map<String, dynamic>.from(matches[i]);
                      final user = Map<String, dynamic>.from(
                        m['user'] ?? m['developer'] ?? m,
                      );
                      final score = (m['score'] ?? 80.0).toDouble();
                      final username = '${user['username'] ?? ''}';

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Panel(
                          child: Row(
                            children: [
                              InitialAvatar(
                                name:
                                    '${user['name'] ?? username ?? 'Developer'}',
                                url: '${user['avatarUrl'] ?? ''}',
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${user['name'] ?? username ?? 'Dev'}',
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold),
                                    ),
                                    Text(
                                      '@$username',
                                      style: const TextStyle(
                                        color: AppColors.muted,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              MatchBadge(score: score),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _create(BuildContext context) async {
    final api = context.read<DevHubApi>();
    final title = TextEditingController();
    final desc = TextEditingController();
    final skills = TextEditingController();

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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Post a Project', style: Theme.of(ctx).textTheme.titleLarge),
            const SizedBox(height: 14),
            TextField(
              controller: title,
              decoration: const InputDecoration(
                labelText: 'Project Title',
                hintText: 'e.g. AI-Powered Portfolio Builder',
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: desc,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Description',
                hintText: 'What are you building and who are you looking for?',
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: skills,
              decoration: const InputDecoration(
                labelText: 'Required skills (comma separated)',
                hintText: 'e.g. React, Node.js, MongoDB',
              ),
            ),
            const SizedBox(height: 16),
            GradientButton(
              label: 'Publish Project',
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
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Project requirement published!')),
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
