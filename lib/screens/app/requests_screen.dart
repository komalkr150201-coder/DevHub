import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/devhub_api.dart';
import '../../core/app_theme.dart';
import '../../widgets/devhub_widgets.dart';

class RequestsScreen extends StatefulWidget {
  const RequestsScreen({super.key});

  @override
  State<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends State<RequestsScreen> {
  late Future<Map<String, dynamic>> future;

  @override
  void initState() {
    super.initState();
    future = context.read<DevHubApi>().requests();
  }

  void reload() =>
      setState(() => future = context.read<DevHubApi>().requests());

  @override
  Widget build(BuildContext context) => FutureBuilder<Map<String, dynamic>>(
        future: future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snap.hasError) {
            return ErrorView(message: '${snap.error}', retry: reload);
          }
          final data = snap.data ?? {};
          final incoming = List<dynamic>.from(data['incoming'] ?? []);
          final outgoing = List<dynamic>.from(data['outgoing'] ?? []);

          return DefaultTabController(
            length: 2,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 18, 18, 8),
                  child: SectionTitle(
                    'Collaboration Requests',
                    subtitle: 'Invitations to connect and build together',
                    trailing: IconButton(
                      onPressed: reload,
                      icon: const Icon(Icons.refresh),
                    ),
                  ),
                ),
                TabBar(
                  indicatorColor: AppColors.violet,
                  labelColor: AppColors.violet,
                  unselectedLabelColor: AppColors.muted,
                  tabs: [
                    Tab(text: 'Received (${incoming.length})'),
                    Tab(text: 'Sent (${outgoing.length})'),
                  ],
                ),
                Expanded(
                  child: TabBarView(
                    children: [
                      _buildList(incoming, isIncoming: true),
                      _buildList(outgoing, isIncoming: false),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      );

  Widget _buildList(List<dynamic> items, {required bool isIncoming}) {
    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.mark_email_read_outlined,
                size: 42, color: AppColors.muted),
            const SizedBox(height: 12),
            Text(
              isIncoming
                  ? 'No incoming collaboration requests.'
                  : 'No outgoing collaboration requests sent yet.',
              style: const TextStyle(color: AppColors.muted),
            ),
          ],
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: items.map((e) {
        final m = Map<String, dynamic>.from(e);
        final person = Map<String, dynamic>.from(
          m[isIncoming ? 'sender' : 'receiver'] ?? {},
        );
        final id = '${m['_id'] ?? m['id'] ?? ''}';
        final status = '${m['status'] ?? 'pending'}';
        final email = '${person['email'] ?? ''}';
        final username = '${person['username'] ?? ''}';

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    InitialAvatar(
                      name: '${person['name'] ?? username ?? 'Dev'}',
                      url: '${person['avatarUrl'] ?? ''}',
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${person['name'] ?? username ?? 'Developer'}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
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
                    SkillPill(
                      status.toUpperCase(),
                      selected: status == 'accepted',
                    ),
                  ],
                ),
                if ('${m['message'] ?? ''}'.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.bg2,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '${m['message']}',
                      style: const TextStyle(color: AppColors.muted),
                    ),
                  ),
                ],

                // Display unlocked contact details if accepted!
                if (status == 'accepted' && email.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Icon(Icons.email_outlined,
                          size: 16, color: AppColors.sky),
                      const SizedBox(width: 6),
                      Text(
                        'Unlocked Contact: $email',
                        style: const TextStyle(
                          color: AppColors.sky,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ],

                if (isIncoming && status == 'pending') ...[
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      OutlinedButton(
                        onPressed: () => _update(id, 'rejected'),
                        child: const Text('Decline'),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.violet,
                          foregroundColor: Colors.white,
                        ),
                        onPressed: () => _update(id, 'accepted'),
                        child: const Text('Accept & Connect'),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Future<void> _update(String id, String status) async {
    try {
      await context.read<DevHubApi>().updateRequest(id, status);
      reload();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Collaboration request $status')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }
}
