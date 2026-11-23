import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../state/auth_state.dart';
import '../../core/app_theme.dart';
import '../../widgets/devhub_widgets.dart';

class RepositoriesScreen extends StatefulWidget {
  const RepositoriesScreen({super.key});

  @override
  State<RepositoriesScreen> createState() => _RepositoriesScreenState();
}

class _RepositoriesScreenState extends State<RepositoriesScreen> {
  String query = '';
  bool pinnedOnly = false;
  bool syncing = false;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    final repos = auth.repos
        .where((r) =>
            (!pinnedOnly || r.pinned) &&
            r.name.toLowerCase().contains(query.toLowerCase()))
        .toList();

    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        SectionTitle(
          'My Repositories',
          subtitle: 'Repositories synced from your GitHub account',
          trailing: TextButton.icon(
            onPressed: syncing
                ? null
                : () async {
                    setState(() => syncing = true);
                    try {
                      await auth.sync();
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('GitHub repositories synced!'),
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
                      if (mounted) setState(() => syncing = false);
                    }
                  },
            icon: syncing
                ? const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.sync, size: 17),
            label: const Text('Sync'),
          ),
        ),
        const SizedBox(height: 14),
        TextField(
          decoration: const InputDecoration(
            prefixIcon: Icon(Icons.search),
            hintText: 'Search repositories...',
          ),
          onChanged: (v) => setState(() => query = v),
        ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Pinned repositories only'),
          value: pinnedOnly,
          onChanged: (v) => setState(() => pinnedOnly = v),
          activeThumbColor: AppColors.violet,
        ),
        const SizedBox(height: 8),
        ...repos.map(
          (r) => Padding(
            padding: const EdgeInsets.only(bottom: 11),
            child: Panel(
              onTap: () => launchExternalUrl(r.url),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.folder_open, color: AppColors.sky),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          r.name,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ),
                      IconButton(
                        tooltip: r.pinned ? 'Unpin repository' : 'Pin repository',
                        onPressed: () async {
                          try {
                            await auth.api.updateRepo(
                              r.id,
                              {'isPinned': !r.pinned},
                            );
                            await auth.loadMe();
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    r.pinned
                                        ? 'Repository unpinned'
                                        : 'Repository pinned to portfolio',
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
                          }
                        },
                        icon: Icon(
                          r.pinned ? Icons.push_pin : Icons.push_pin_outlined,
                          color: r.pinned ? AppColors.violet : AppColors.muted,
                        ),
                      ),
                    ],
                  ),
                  if (r.description.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        r.description,
                        style: const TextStyle(color: AppColors.muted),
                      ),
                    ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Text(
                        '★ ${r.stars}',
                        style: const TextStyle(
                          color: AppColors.amber,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        '⑂ ${r.forks}',
                        style: const TextStyle(color: AppColors.muted),
                      ),
                      const Spacer(),
                      if (r.url.isNotEmpty)
                        IconButton(
                          tooltip: 'Open in GitHub',
                          icon: const Icon(
                            Icons.open_in_new,
                            size: 18,
                            color: AppColors.muted,
                          ),
                          onPressed: () => launchExternalUrl(r.url),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        if (repos.isEmpty)
          const Padding(
            padding: EdgeInsets.all(30),
            child: Text(
              'No repositories match this filter. Sync GitHub data or adjust your search query.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.muted),
            ),
          ),
      ],
    );
  }
}
