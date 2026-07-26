import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:mountain100/main.dart';
import 'package:mountain100/mountains.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('百名山データは100座ある', () {
    expect(mountains.length, 100);
    expect(mountains.map((m) => m.id).toSet().length, 100);
  });

  testWidgets('一覧と進捗が表示される', (tester) async {
    await tester.pumpWidget(const Mountain100App());
    await tester.pumpAndSettle();

    expect(find.text('日本百名山'), findsOneWidget);
    expect(find.text('登頂 0 / 100 座'), findsOneWidget);
    expect(find.textContaining('利尻岳'), findsOneWidget);
  });

  testWidgets('チェックすると登頂数が増える', (tester) async {
    await tester.pumpWidget(const Mountain100App());
    await tester.pumpAndSettle();

    await tester.tap(find.byType(CheckboxListTile).first);
    await tester.pumpAndSettle();

    expect(find.text('登頂 1 / 100 座'), findsOneWidget);
  });
}
