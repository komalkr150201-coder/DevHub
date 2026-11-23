import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_theme.dart';
import '../../state/auth_state.dart';
import '../app/dashboard_screen.dart';
import '../app/portfolio_screen.dart';
import '../app/repositories_screen.dart';
import '../app/skills_screen.dart';
import '../app/developers_screen.dart';
import '../app/requests_screen.dart';
import '../app/settings_screen.dart';
import '../app/portfolio_studio_screen.dart';
import '../app/projects_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  static _AppShellState? of(BuildContext context) =>
      context.findAncestorStateOfType<_AppShellState>();

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int index = 0;

  void setTab(int i) {
    if (i >= 0 && i < pages.length) {
      setState(() => index = i);
    }
  }

  final pages = const [
    DashboardScreen(),
    PortfolioScreen(),
    RepositoriesScreen(),
    SkillsScreen(),
    DevelopersScreen(),
    RequestsScreen(),
    ProjectsScreen(),
    PortfolioStudioScreen(),
    SettingsScreen(),
  ];

  final labels = [
    'Home',
    'Portfolio',
    'Repos',
    'Skills',
    'Discover & Match',
    'Requests',
    'Project Boards',
    'AI Studio',
    'Settings',
  ];

  final icons = [
    Icons.dashboard_rounded,
    Icons.badge_outlined,
    Icons.folder_open_outlined,
    Icons.code_rounded,
    Icons.people_alt_outlined,
    Icons.mark_email_unread_outlined,
    Icons.rocket_launch_outlined,
    Icons.auto_awesome,
    Icons.settings_outlined,
  ];

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthState>().user;
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                gradient: AppColors.gradient,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.hub_rounded, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 9),
            const Text(
              'DevHub',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                letterSpacing: -.5,
              ),
            ),
          ],
        ),
        actions: [
          if (user != null)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: InkWell(
                onTap: () => setTab(1), // Go to portfolio tab
                child: CircleAvatar(
                  radius: 17,
                  backgroundColor: AppColors.violet,
                  backgroundImage: user.avatarUrl.startsWith('http')
                      ? NetworkImage(user.avatarUrl)
                      : null,
                  child: user.avatarUrl.isEmpty ? Text(user.initials) : null,
                ),
              ),
            ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: AppColors.bg2,
        child: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 12),
              ListTile(
                leading: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: AppColors.gradient,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.hub_rounded, color: Colors.white, size: 20),
                ),
                title: const Text(
                  'DevHub Workspace',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
                ),
                subtitle: Text(
                  '@${user?.username ?? ''}',
                  style: const TextStyle(color: AppColors.muted),
                ),
              ),
              const Divider(),
              Expanded(
                child: ListView.builder(
                  itemCount: labels.length,
                  itemBuilder: (context, i) => ListTile(
                    selected: index == i,
                    selectedTileColor: AppColors.violet.withOpacity(.18),
                    leading: Icon(
                      icons[i],
                      color: index == i ? AppColors.violet : AppColors.muted,
                    ),
                    title: Text(
                      labels[i],
                      style: TextStyle(
                        fontWeight:
                            index == i ? FontWeight.bold : FontWeight.normal,
                        color: index == i ? Colors.white : AppColors.muted,
                      ),
                    ),
                    onTap: () {
                      setTab(i);
                      Navigator.pop(context);
                    },
                  ),
                ),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.logout, color: AppColors.red),
                title: const Text('Sign out'),
                onTap: () async {
                  await context.read<AuthState>().signOut();
                  if (context.mounted) {
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      '/',
                      (_) => false,
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
      body: IndexedStack(index: index, children: pages),
      bottomNavigationBar: NavigationBar(
        backgroundColor: AppColors.bg2,
        indicatorColor: AppColors.violet.withOpacity(.25),
        selectedIndex: _bottomNavIndex(index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded, color: AppColors.violet),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.badge_outlined),
            selectedIcon: Icon(Icons.badge, color: AppColors.violet),
            label: 'Profile',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people, color: AppColors.violet),
            label: 'Discover',
          ),
          NavigationDestination(
            icon: Icon(Icons.rocket_launch_outlined),
            selectedIcon: Icon(Icons.rocket_launch, color: AppColors.violet),
            label: 'Projects',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu),
            label: 'More',
          ),
        ],
        onDestinationSelected: (i) {
          if (i == 4) {
            showModalBottomSheet(
              context: context,
              backgroundColor: AppColors.bg2,
              builder: (ctx) => SafeArea(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(
                    labels.length,
                    (j) => ListTile(
                      leading: Icon(icons[j], color: AppColors.muted),
                      title: Text(labels[j]),
                      onTap: () {
                        Navigator.pop(ctx);
                        setTab(j);
                      },
                    ),
                  ),
                ),
              ),
            );
          } else {
            setTab([0, 1, 4, 6][i]);
          }
        },
      ),
    );
  }

  int _bottomNavIndex(int current) {
    if (current == 0) return 0;
    if (current == 1) return 1;
    if (current == 4) return 2;
    if (current == 6) return 3;
    return 4;
  }
}
