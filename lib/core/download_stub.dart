import 'dart:typed_data';
import 'package:url_launcher/url_launcher.dart';

Future<void> downloadFile(Uint8List bytes, String filename) async {
  final dataUri = Uri.dataFromBytes(bytes, mimeType: 'application/zip');
  if (await canLaunchUrl(dataUri)) {
    await launchUrl(dataUri);
  } else {
    throw Exception('Could not trigger download on this platform.');
  }
}
