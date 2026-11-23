import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/devhub_api.dart';
import '../../core/app_theme.dart';
import '../../widgets/devhub_widgets.dart';

class PublicProfileScreen extends StatefulWidget {
  final String username;
  const PublicProfileScreen({super.key, required this.username});

  @override
  State<PublicProfileScreen> createState() => _PublicProfileScreenState();
}

class _PublicProfileScreenState extends State<PublicProfileScreen> {
  late Future<Map<String, dynamic>> future;

  @override
  void initState() {
    super.initState();
    future = context.read<DevHubApi>().publicProfile(widget.username);
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: Text('@${widget.username}'),
        ),
        body: FutureBuilder<Map<String, dynamic>>(
          future: future,
          builder: (context, s) {
            if (s.connectionState == ConnectionState.waiting) {
              return const LoadingView();
            }
            if (s.hasError) {
              return ErrorView(
                message: '${s.error}',
                retry: () => setState(() =>
                    future = context.read<DevHubApi>().publicProfile(widget.username)),
              );
            }
            final user = Map<String, dynamic>.from(s.data?['user'] ?? {});
            final skills = List<dynamic>.from(s.data?['skills'] ?? []);
            final repos = List<dynamic>.from(s.data?['repos'] ?? []);
            final links = Map<String, dynamic>.from(user['links'] ?? {});
            final id = '${user['_id'] ?? user['id'] ?? ''}';

            return ListView(
              padding: const EdgeInsets.all(18),
              children: [
                Panel(
                  child: Column(
                    children: [
                      InitialAvatar(
                        name: '${user['name'] ?? widget.username}',
                        url: '${user['avatarUrl'] ?? ''}',
                        size: 82,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '${user['name'] ?? widget.username}',
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      Text(
                        '@${user['username'] ?? widget.username}',
                        style: const TextStyle(color: AppColors.muted),
                      ),
                      if ('${user['headline'] ?? ''}'.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(
                          '${user['headline']}',
                          style: const TextStyle(
                            color: AppColors.sky,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                      if ('${user['bio'] ?? ''}'.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Text(
                          '${user['bio']}',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: AppColors.muted),
                        ),
                      ],
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        alignment: WrapAlignment.center,
                        children: [
                          if ('${links['website'] ?? ''}'.isNotEmpty)
                            OutlinedButton.icon(
                              icon: const Icon(Icons.language, size: 16),
                              label: const Text('Website'),
                              onPressed: () =>
                                  launchExternalUrl('${links['website']}'),
                            ),
                          if ('${links['linkedin'] ?? ''}'.isNotEmpty)
                            OutlinedButton.icon(
                              icon: const Icon(Icons.link, size: 16),
                              label: const Text('LinkedIn'),
                              onPressed: () =>
                                  launchExternalUrl('${links['linkedin']}'),
                            ),
                          GradientButton(
                            label: 'Collaborate',
                            icon: Icons.handshake_outlined,
                            onPressed: () => _invite(context, id, widget.username),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                SectionTitle('Skills & Competencies'),
                const SizedBox(height: 10),
                Panel(
                  child: Wrap(
                    spacing: 7,
                    runSpacing: 7,
                    children: skills
                        .map((e) => SkillPill(e is Map ? '${e['name']}' : '$e'))
                        .toList(),
                  ),
                ),
                const SizedBox(height: 20),
                SectionTitle('Repositories'),
                const SizedBox(height: 10),
                ...repos.map((e) {
                  final r = Map<String, dynamic>.from(e);
                  final repoUrl = '${r['url'] ?? ''}';
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Panel(
                      onTap: () => launchExternalUrl(repoUrl),
                      child: Row(
                        children: [
                          const Icon(Icons.folder_open, color: AppColors.sky),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${r['name'] ?? 'Repository'}',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold),
                                ),
                                if ('${r['description'] ?? ''}'.isNotEmpty)
                                  Text(
                                    '${r['description']}',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: AppColors.muted,
                                      fontSize: 12,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          Text(
                            '★ ${r['stars'] ?? 0}',
                            style: const TextStyle(color: AppColors.amber),
                          ),
                          if (repoUrl.isNotEmpty) ...[
                            const SizedBox(width: 8),
                            IconButton(
                              icon: const Icon(Icons.open_in_new,
                                  size: 16, color: AppColors.muted),
                              onPressed: () => launchExternalUrl(repoUrl),
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                }),
              ],
            );
          },
        ),
      );

  Future<void> _invite(BuildContext context, String id, String username) async {
    final controller = TextEditingController(
      text:
          'Hi! I visited your public profile on DevHub and would love to collaborate on a project with you.',
    );
    final message = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: Text('Invite @$username'),
        content: TextField(
          controller: controller,
          maxLines: 4,
          decoration: const InputDecoration(
            labelText: 'Invitation message',
            hintText: 'Describe project details or ideas...',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, controller.text),
            child: const Text('Send Invitation'),
          ),
        ],
      ),
    );
    if (message == null) return;
    try {
      await context.read<DevHubApi>().sendRequest({
        'receiverId': id.isEmpty ? null : id,
        'receiverUsername': username,
        'message': message,
      });
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Collaboration invitation sent to @$username'),
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
}
