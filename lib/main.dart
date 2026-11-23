import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/app_theme.dart';
import 'core/app_router.dart';
import 'state/auth_state.dart';
import 'services/devhub_api.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(MultiProvider(
    providers: [
      Provider(create: (_) => DevHubApi()),
      ChangeNotifierProvider(create: (context) => AuthState(context.read<DevHubApi>())..restore()),
    ],
    child: const DevHubApp(),
  ));
}

class DevHubApp extends StatelessWidget {
  const DevHubApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'DevHub',
    debugShowCheckedModeBanner: false,
    theme: AppTheme.dark,
    onGenerateRoute: AppRouter.onGenerateRoute,
    initialRoute: '/',
  );
}
